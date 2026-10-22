from config import setting
from .base import Collection
from .generic_web import collect_url

def collect():
    url=setting('FTC_SOURCE_URL')
    if not url:
        return Collection(status='미구현', message='기관 전용 API Adapter 미연동. 공식 RSS/상세 HTML URL 설정 시 공통 수집 사용')
    from urllib.parse import urlparse
    host=urlparse(url).hostname or ''
    if not (host == 'ftc.go.kr' or host.endswith('.ftc.go.kr')):
        return Collection(status='오류', message='기관 공식 도메인만 허용')
    return collect_url(url, '공정거래위원회')
