from dataclasses import dataclass, field
from datetime import datetime, timezone
import hashlib
import requests

@dataclass
class Collection:
    items: list = field(default_factory=list)
    status: str = '미구현'
    message: str = ''
    complete: bool = False

class SourceError(Exception):
    pass

def fetch(url, params=None):
    try:
        response = requests.get(url, params=params, timeout=(5, 20), headers={'User-Agent': 'ComplianceAXDemo/0.1 (public research)'})
        response.raise_for_status()
        if len(response.content) > 5_000_000:
            raise SourceError('응답 크기 제한 초과')
        return response
    except requests.RequestException:
        # Requests exceptions may contain credentials in query strings.
        raise SourceError('데이터 요청 실패: 연결·인증·응답 상태를 확인하세요') from None

def document(org, kind, title, body, url='', document_id='', published_date='', **extra):
    return dict(source_org=org, source_type=kind, title=str(title), body=str(body), url=url,
                document_id=str(document_id or ''), published_date=str(published_date or ''),
                collected_at=datetime.now(timezone.utc).isoformat(), **extra)
