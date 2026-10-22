"""Refresh fictional browser fixtures using the existing Python Rule Engine."""
from pathlib import Path
import sys
import json
from copy import deepcopy
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from analyzer import analyze
from delta_detector import detect

folder=Path(__file__).resolve().parent
baseline=json.loads((folder.parent/'data/sample_issues.json').read_text(encoding='utf-8'))
for item in baseline:
    item['process_status']='검토 중'
changed=deepcopy(baseline[:3])
changed[0]['body']+=' [가상 변경] 계약 갱신 안내와 점주 사전 고지 절차의 점검 항목이 추가되었습니다.'
changed[1]['process_status']='의결'
changed[1]['body']+=' [가상 변경] 처리 단계가 의결로 변경되었습니다.'
changed.append(dict(source_org='샘플 기관', source_type='가상 샘플',title='[가상] 온라인 주문 개인정보 점검',body='편의점 온라인 주문의 개인정보 처리 및 전자상거래 소비자 안내 의무를 확인하는 가상 자료입니다.',document_id='demo-4',url='',published_date='2026-10-22',collected_at='2026-10-22T00:00:00+00:00',process_status='접수'))
scenarios=[]
for key,label,items,previous in [('initial','첫 수집',baseline,[]),('changes','변경 발생',changed,baseline)]:
    rows=[analyze(i) for i in detect(items,previous,complete=True)]
    scenarios.append(dict(id=key,label=label,items=rows))
(folder/'data/demo.json').write_text(json.dumps({'date':'2026-10-22','scenarios':scenarios},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Fictional scenarios generated with Python Rule Engine')
