import hashlib
import re
import difflib
from urllib.parse import urlsplit, urlunsplit

def normalize(text):
    return re.sub(r'\s+', ' ', str(text)).strip()

def identity(item):
    org=item.get('source_org','')
    official=item.get('law_id') or item.get('bill_id') or item.get('document_id')
    if official:
        raw=f'{org}:id:{official}'
    elif item.get('url'):
        u=urlsplit(item['url'])
        raw=urlunsplit((u.scheme.lower(), u.netloc.lower(), u.path, u.query, ''))
    else:
        raw=f'{org}:{normalize(item.get("title", ""))}'
    return hashlib.sha256(raw.encode()).hexdigest()

def fingerprint(item):
    # Include status and effective date even when the textual body is unchanged.
    raw='|'.join(normalize(item.get(k,'')) for k in ['title','body','process_status','legal_status','effective_date','amendment_type'])
    return hashlib.sha256(raw.encode()).hexdigest()

def detect(current, previous, complete=False):
    old={identity(i):i for i in previous}
    results=[]
    seen=set()
    for item in current:
        key=identity(item)
        if key in seen:
            continue
        seen.add(key)
        before=old.get(key)
        state='NEW' if before is None else ('UNCHANGED' if fingerprint(before)==fingerprint(item) else 'UPDATED')
        transition=''
        if before and state=='UPDATED':
            status=item.get('process_status','')
            if status!=before.get('process_status','') and any(w in status for w in ['철회','가결','폐기','부결','의결']):
                state='CLOSED'
            if item.get('legal_status') in ['폐지','폐지법령']:
                state='CLOSED'
            transition=' → '.join([before.get('process_status',''),status]).strip(' →')
        from datetime import datetime
        from zoneinfo import ZoneInfo
        today=datetime.now(ZoneInfo('Asia/Seoul')).strftime('%Y%m%d')
        effective=re.sub(r'[^0-9]', '', item.get('effective_date',''))
        old_seen=(before or {}).get('last_seen_date','')
        if before and effective and old_seen and old_seen < effective <= today and state != 'CLOSED':
            state='EFFECTIVE'
        results.append({**item,'last_seen_date':today,'identity':key,'body_hash':hashlib.sha256(normalize(item.get('body','')).encode()).hexdigest(),'content_hash':fingerprint(item),'delta':state,
                        'status_transition':transition,
                        'diff':'\n'.join(difflib.unified_diff(before.get('body','').splitlines(), item.get('body','').splitlines(), lineterm=''))[:10000] if before and state!='UNCHANGED' else ''})
    if complete:
        results.extend({**i,'delta':'REMOVED'} for k,i in old.items() if k not in seen)
    return results
