import json
import streamlit as st
import pandas as pd
from config import ROOT, setting
from collectors.law import LawCollector
from collectors.assembly import AssemblyCollector
from collectors import ftc, pipc
from collectors.generic_web import collect_url
from collectors.base import Collection
from storage import HistoryStore, export_pair
from delta_detector import detect, identity
from analyzer import analyze, ollama_models, synthesize
from briefing import daily_briefing

st.set_page_config(page_title='Compliance AX Demo', layout='wide')
st.title('준법지원 Compliance AX Demo')
st.caption('공개 데이터 PoC · 샘플은 가상 자료 · External LLM API: Disabled')
if 'issues' not in st.session_state:
    st.session_state.issues=[]
if 'sources' not in st.session_state:
    st.session_state.sources={}
with st.sidebar:
    source=st.selectbox('데이터 수집', ['가상 샘플','국가법령정보센터 API','국회 입법 API','공정위','개인정보보호위원회','Generic Web'])
    query=st.text_input('법령명/입법 키워드', '가맹')
    url=st.text_input('공개 상세 URL / RSS')
    use_llm=st.checkbox('로컬 Ollama 사용',False)
    models=ollama_models() if use_llm else []
    model=st.selectbox('설치된 로컬 모델', models) if models else setting('OLLAMA_MODEL','qwen2.5:3b')
    run=st.button('수집 → 변경 탐지 → 분석',type='primary')
if run:
    with st.spinner('수집·분석 중'):
        if source=='가상 샘플':
            batch=Collection(json.loads((ROOT/'data/sample_issues.json').read_text(encoding='utf-8')),'연결됨','가상 샘플 데이터',True)
        elif source=='국가법령정보센터 API': batch=LawCollector().collect(query)
        elif source=='국회 입법 API': batch=AssemblyCollector().collect(query)
        elif source=='공정위': batch=ftc.collect()
        elif source=='개인정보보호위원회': batch=pipc.collect()
        else: batch=collect_url(url)
        st.session_state.sources[source]=(batch.status,batch.message)
        if batch.status=='연결됨':
            scope=source+':'+(url if source=='Generic Web' else query if 'API' in source else '')
            store=HistoryStore()
            changes=detect(batch.items,store.load(scope),complete=batch.complete)
            st.session_state.issues=[analyze(i,use_llm,model) for i in changes]
            st.session_state.insights=synthesize(st.session_state.issues,use_llm,model)
            snapshot={identity(i):i for i in store.load(scope)} if not batch.complete else {}
            snapshot.update({identity(i):i for i in changes if i['delta']!='REMOVED'})
            store.save(scope,list(snapshot.values()))
            st.success(f'{len(batch.items)}건 수집. '+batch.message)
        else: st.warning(batch.message)
issues=st.session_state.issues
board,brief,system=st.tabs(['이슈 대시보드','데일리 브리핑','시스템 정보'])
with board:
    st.metric('분석 이슈',len(issues))
    relevant_only=st.checkbox('관련 이슈만 표시',True)
    levels=st.multiselect('중요도',['상','중','하'],default=['상','중','하'])
    shown=[i for i in issues if i['importance'] in levels and (i['relevant'] or not relevant_only)]
    if shown:
        st.dataframe(pd.DataFrame(shown)[['title','delta','importance','importance_score','relevance_score','impact_areas','engine']],hide_index=True)
        for i in shown:
            with st.expander(i['title']):
                st.write(i['summary']); st.write(i['review_points']); st.write('점수 근거: '+i['rule_reasons'])
                st.text(i.get('url','')); st.code(i.get('diff','') or '본문 차이 없음')
    if issues and st.button('CSV + Parquet 함께 저장'):
        csv,pq=export_pair(issues)
        st.success('두 형식 저장 완료: '+csv.name+' / '+pq.name)
        st.download_button('CSV 다운로드',csv.read_bytes(),file_name=csv.name,mime='text/csv')
        st.download_button('Parquet 다운로드',pq.read_bytes(),file_name=pq.name,mime='application/octet-stream')
with brief:
    text=daily_briefing(issues)
    st.markdown(text)
    if 'insights' in st.session_state:
        insight,engine=st.session_state.insights
        st.subheader('종합 인사이트')
        st.write(insight)
        st.caption(engine)
    st.download_button('브리핑 Markdown',text,file_name='daily_briefing.md')
with system:
    st.subheader('Data Sources')
    defaults={'국가법령정보센터 API':('인증키 미설정' if not setting('LAW_API_OC') else '연결 미검증','검색·본문·법령 연혁 지원 / 조문 변경이력 미연동'),
              '국회 입법 API':('인증키 미설정' if not setting('ASSEMBLY_API_KEY') else '연결 미검증','22대 의원발의 / 상세 제안이유 미연동'),
              '공정위':('미구현','전용 API 미연동. 공식 URL 설정 시 HTML/RSS 수집'),
              '개인정보보호위원회':('미구현','전용 API 미연동. 공식 URL 설정 시 HTML/RSS 수집'),
              'Generic Web':('연결 미검증','공개 URL 입력 후 수집')}
    for name,default in defaults.items():
        state,message=st.session_state.sources.get(name,default)
        st.write(f'{name}: {state} — {message}')
    st.subheader('AI Engine')
    st.write('Rule Engine: Active')
    if st.button('Ollama 연결 확인'):
        available=ollama_models()
        st.write('Ollama: Connected / '+', '.join(available) if available else 'Ollama: Disconnected 또는 설치 모델 없음')
    st.write('External LLM API: Disabled')
