from .base import Collection, document, fetch
from config import setting

# 열린국회정보: 국회의원 발의 법률안 (22대). API dataset identifier is service-specific.
ENDPOINT = 'https://open.assembly.go.kr/portal/openapi/nzmimeepazxkubdpn'
class AssemblyCollector:
    def __init__(self, key=None):
        self.key = setting('ASSEMBLY_API_KEY') if key is None else key
    def collect(self, query):
        if not self.key:
            return Collection(status='인증키 미설정', message='국회 API 인증키 미설정')
        try:
            data=fetch(ENDPOINT, {'KEY':self.key, 'Type':'json', 'pIndex':1, 'pSize':100, 'AGE':22, 'BILL_NAME':query}).json()
            blocks=data.get('nzmimeepazxkubdpn', [])
            rows=next((b['row'] for b in blocks if 'row' in b), None)
            if rows is None:
                raise ValueError('응답 오류 또는 결과 없음')
            items=[]
            for r in rows:
                items.append(document('대한민국 국회', '입법 API', r.get('BILL_NAME',''),
                    '\n'.join(f'{k}: {r.get(k) or ""}' for k in ['BILL_NAME','PROPOSER','COMMITTEE','PROC_RESULT','RST_PROPOSER']),
                    r.get('DETAIL_LINK',''), r.get('BILL_ID',''), r.get('PROPOSE_DT',''),
                    bill_id=r.get('BILL_ID',''), bill_number=r.get('BILL_NO',''), proposer=r.get('PROPOSER',''),
                    committee=r.get('COMMITTEE',''), process_status=r.get('PROC_RESULT') or '접수/심사 중',
                    proposal_reason='', main_content=''))
            return Collection(items, '연결됨', '22대 의원발의 검색 100건; 제안이유/주요내용 상세 API 미연동', False)
        except Exception:
            return Collection(status='오류', message='국회 API 인증/서비스/응답 확인 필요')
