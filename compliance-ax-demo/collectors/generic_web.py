from urllib.parse import urlparse
import ipaddress
import socket
from bs4 import BeautifulSoup
import feedparser
from .base import Collection, document, fetch, SourceError

def public_url(url):
    p = urlparse(url)
    if p.scheme not in ('http', 'https') or not p.hostname or p.username or p.password:
        raise SourceError('HTTP(S) 공개 URL만 지원합니다')
    try:
        addresses = socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == 'https' else 80))
    except OSError:
        raise SourceError('호스트 조회 실패') from None
    if any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
        raise SourceError('내부/루프백 주소는 수집할 수 없습니다')
    return url

def collect_url(url, org='직접 입력'):
    try:
        public_url(url)
        # Validate each redirect before following it.
        from urllib.parse import urljoin
        import requests
        current = url
        for _ in range(6):
            r = requests.get(public_url(current), timeout=(5, 15), allow_redirects=False)
            r.raise_for_status()
            if r.is_redirect:
                current = urljoin(current, r.headers['Location'])
                continue
            break
        else:
            raise SourceError('리디렉션 한도 초과')
        if len(r.content) > 5_000_000:
            raise SourceError('응답 크기 제한 초과')
        if 'xml' in r.headers.get('Content-Type', '') or r.text.lstrip().startswith(('<?xml', '<rss', '<feed')):
            feed = feedparser.parse(r.content)
            items = [document(org, 'RSS', e.get('title', ''), BeautifulSoup(e.get('summary',''), 'html.parser').get_text(' ',strip=True), e.get('link',''), e.get('id',''), e.get('published','')) for e in feed.entries]
            if not items:
                raise SourceError('RSS 항목 없음')
        else:
            soup = BeautifulSoup(r.content, 'html.parser')
            title = soup.title.get_text(' ', strip=True) if soup.title else current
            for node in soup(['script', 'style', 'nav', 'footer', 'header']):
                node.decompose()
            content = soup.find('article') or soup.find('main') or soup.body or soup
            body = content.get_text(' ', strip=True)
            if not body:
                raise SourceError('추출된 본문 없음')
            items = [document(org, 'HTML', title, body, current)]
        return Collection(items, '연결됨', '부분 수집: 삭제 판정 불가', False)
    except Exception:
        return Collection(status='오류', message='URL 수집 실패: 공개 주소·응답·접근 정책을 확인하세요')
