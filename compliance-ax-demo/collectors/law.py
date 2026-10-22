import xml.etree.ElementTree as ET
from .base import Collection, document, fetch, SourceError
from config import setting

BASE = 'https://www.law.go.kr/DRF/'
class LawCollector:
    def __init__(self, oc=None):
        self.oc = setting('LAW_API_OC') if oc is None else oc

    def request(self, service, **params):
        if not self.oc:
            raise SourceError('법령 API 인증값 미설정')
        return ET.fromstring(fetch(BASE + service, {'OC': self.oc, 'type': 'XML', **params}).content)

    def collect(self, query):
        if not self.oc:
            return Collection(status='인증키 미설정', message='법령 API 인증값 미설정')
        try:
            root = self.request('lawSearch.do', target='law', query=query, display=20)
            if root.find('.//totalCnt') is None:
                raise SourceError('API 응답 구조/인증 확인 필요')
            items=[]
            for law in root.findall('.//law'):
                v=lambda k: law.findtext(k, '')
                ident=v('법령일련번호') or v('법령ID')
                body_root=self.request('lawService.do', target='law', MST=ident)
                body=' '.join(t.strip() for t in body_root.itertext() if t.strip())
                items.append(document('국가법령정보센터', '법령 API', v('법령명한글'), body,
                    'https://www.law.go.kr/법령/' + v('법령명한글'), ident, v('공포일자'),
                    law_id=v('법령ID'), effective_date=v('시행일자'), legal_status=v('현행연혁코드'), amendment_type=v('제개정구분명')))
            return Collection(items, '연결됨', '검색 상위 20건: 전체 삭제 판정 금지', False)
        except Exception:
            return Collection(status='오류', message='법령 API 연결/인증/본문 응답 확인 필요')

    def detail(self, mst):
        return self.request('lawService.do', target='law', MST=mst)

    def history(self, query):
        # Search API nw=2: historical laws. Article revisions require separate approved API.
        return self.request('lawSearch.do', target='law', query=query, nw=2, display=100)
