from datetime import datetime
from zoneinfo import ZoneInfo

def daily_briefing(items):
    active=[i for i in items if i.get('delta')!='REMOVED' and i.get('relevant')]
    active.sort(key=lambda i:i.get('importance_score',0),reverse=True)
    date=datetime.now(ZoneInfo('Asia/Seoul')).strftime('%Y-%m-%d')
    lines=[f'# {date} 준법 데일리 브리핑', '공개 자료 기반 PoC · 법률 자문 아님', f'관련 이슈 {len(active)}건 / 신규·변경 {sum(i.get("delta") not in ("UNCHANGED","REMOVED") for i in active)}건']
    for i in active:
        lines.extend([f'## [{i["importance"]}] {i["title"]} ({i["delta"]})',i['summary'],
                      '영향: '+i['impact_areas'],'검토: '+i['review_points'],'출처: '+i.get('url','')])
    return '\n\n'.join(lines)

if __name__ == '__main__':
    import argparse
    import json
    from config import ROOT, OUTPUTS
    from storage import HistoryStore, export_pair
    from delta_detector import detect, identity
    from analyzer import analyze
    from collectors.law import LawCollector
    from collectors.assembly import AssemblyCollector
    from collectors import ftc, pipc
    from collectors.base import Collection
    parser=argparse.ArgumentParser(description='공개 자료 수집 및 브리핑 저장')
    parser.add_argument('--source', choices=['sample','law','assembly','ftc','pipc'], default='sample')
    parser.add_argument('--query',default='가맹')
    parser.add_argument('--ollama', action='store_true')
    args=parser.parse_args()
    if args.source=='sample':
        batch=Collection(json.loads((ROOT/'data/sample_issues.json').read_text(encoding='utf-8')),'연결됨','가상 데이터',True)
    elif args.source=='law': batch=LawCollector().collect(args.query)
    elif args.source=='assembly': batch=AssemblyCollector().collect(args.query)
    elif args.source=='ftc': batch=ftc.collect()
    else: batch=pipc.collect()
    if batch.status!='연결됨':
        parser.exit(1, batch.status+': '+batch.message+'\n')
    scope=args.source+':'+args.query
    store=HistoryStore()
    previous=store.load(scope)
    changes=detect(batch.items,previous,batch.complete)
    analyzed=[analyze(i,args.ollama) for i in changes]
    csv,pq=export_pair(analyzed)
    md=csv.with_suffix('.md')
    md.write_text(daily_briefing(analyzed),encoding='utf-8')
    snapshot={identity(i):i for i in previous} if not batch.complete else {}
    snapshot.update({identity(i):i for i in changes if i['delta']!='REMOVED'})
    store.save(scope,list(snapshot.values()))
    print(f'{len(analyzed)}건 / {csv.name} / {pq.name} / {md.name}')
