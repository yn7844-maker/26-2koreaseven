import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, Mock
import pandas as pd
from collectors.base import document
from collectors.law import LawCollector
from collectors.assembly import AssemblyCollector
from collectors.generic_web import collect_url
from analyzer import analyze, ollama_models, local_base, synthesize
from delta_detector import detect, identity
from storage import HistoryStore, export_pair
from briefing import daily_briefing

class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.items=json.loads(Path('data/sample_issues.json').read_text())

    def test_sample_pipeline_and_exports(self):
        with tempfile.TemporaryDirectory() as folder:
            store=HistoryStore(folder)
            rows=[analyze(i) for i in detect(self.items,store.load('sample'),True)]
            self.assertEqual(len(rows),4)
            self.assertTrue(all(i['delta']=='NEW' for i in rows))
            self.assertEqual(rows[0]['importance'],'상')
            self.assertTrue(rows[0]['relevant'])
            store.save('sample',rows)
            again=detect(self.items,store.load('sample'),True)
            self.assertTrue(all(i['delta']=='UNCHANGED' for i in again))
            csv,pq=export_pair(rows,folder)
            self.assertEqual(csv.stem,pq.stem)
            self.assertEqual(csv.read_bytes()[:3],b'\xef\xbb\xbf')
            pd.testing.assert_frame_equal(pd.read_csv(csv,keep_default_na=False,dtype=str),pd.read_parquet(pq).astype(str),check_dtype=False)
            self.assertIn('관련 이슈 4건',daily_briefing(rows))

    def test_delta_status_body_removal_and_effective(self):
        old={**self.items[0],'process_status':'접수'}
        changed={**old,'body':'개정 본문','process_status':'심사'}
        self.assertEqual(detect([changed],[old])[0]['delta'],'UPDATED')
        self.assertTrue(detect([changed],[old])[0]['diff'])
        self.assertEqual(detect([{**old,'process_status':'철회'}],[old])[0]['delta'],'CLOSED')
        self.assertEqual(detect([], [old]),[])
        self.assertEqual(detect([], [old],True)[0]['delta'],'REMOVED')
        before={**old,'effective_date':'20200101','last_seen_date':'20191231'}
        self.assertEqual(detect([before],[before])[0]['delta'],'EFFECTIVE')
        a={**old,'law_id':'stable','document_id':'revision-1'}
        self.assertEqual(identity(a),identity({**a,'document_id':'revision-2'}))

    def test_missing_keys_and_ollama_failure(self):
        self.assertEqual(LawCollector('').collect('가맹').status,'인증키 미설정')
        self.assertEqual(AssemblyCollector('').collect('유통').status,'인증키 미설정')
        with patch('analyzer.requests.post',side_effect=ConnectionError):
            self.assertIn('fallback',analyze(self.items[0],True)['engine'])

    def test_ollama_present_and_remote_blocked(self):
        response=Mock()
        response.json.return_value={'response':json.dumps({'summary':'요약','impact_areas':'점포','review_points':'시행일 검토'})}
        with patch('analyzer.requests.post',return_value=response) as call:
            result=analyze(self.items[0],True,'test-local-model')
            self.assertEqual(result['engine'],'Local Ollama')
            self.assertTrue(call.call_args.args[0].startswith('http://localhost:11434/'))
        with patch.dict('os.environ',{'OLLAMA_BASE_URL':'https://external.example.com'}):
            with self.assertRaises(ValueError): local_base()
        response.json.return_value={'response':'invalid json'}
        with patch('analyzer.requests.post',return_value=response):
            self.assertIn('fallback',analyze(self.items[0],True)['engine'])

    def test_multi_issue_insights(self):
        rows=[analyze(i) for i in self.items]
        self.assertIn('우선 검토',synthesize(rows)[0])
        response=Mock()
        response.json.return_value={'response':json.dumps({'insights':'가맹과 개인정보를 우선 확인'})}
        with patch('analyzer.requests.post',return_value=response):
            self.assertEqual(synthesize(rows,True)[1],'Local Ollama')
        with patch('analyzer.requests.post',side_effect=ConnectionError):
            self.assertIn('fallback',synthesize(rows,True)[1])

    def test_keyed_law_search_and_detail(self):
        search=Mock(content='<LawSearch><totalCnt>1</totalCnt><law><법령명한글>개인정보 보호법</법령명한글><법령ID>law-1</법령ID><법령일련번호>100</법령일련번호><시행일자>20270101</시행일자></law></LawSearch>'.encode())
        detail=Mock(content='<법령><조문>개인정보 의무 개정</조문></법령>'.encode())
        with patch('collectors.law.fetch',side_effect=[search,detail]) as call:
            result=LawCollector('test-key').collect('개인정보')
            self.assertEqual(result.status,'연결됨')
            self.assertEqual(result.items[0]['law_id'],'law-1')
            self.assertIn('개인정보 의무',result.items[0]['body'])
            self.assertEqual(call.call_args_list[0].args[1]['OC'],'test-key')

    def test_keyed_assembly(self):
        response=Mock()
        response.json.return_value={'nzmimeepazxkubdpn':[{'head':[]},{'row':[{'BILL_ID':'b-1','BILL_NAME':'가맹 개정','PROPOSE_DT':'2026-10-01','PROC_RESULT':'가결','BILL_NO':'220001'}]}]}
        with patch('collectors.assembly.fetch',return_value=response):
            result=AssemblyCollector('test-key').collect('가맹')
            self.assertEqual(result.status,'연결됨')
            self.assertEqual(result.items[0]['process_status'],'가결')

    def test_html_rss_and_failure(self):
        response=Mock(status_code=200,is_redirect=False,headers={'Content-Type':'text/html'})
        response.content='<html><title>공식 문서</title><article>편의점 가맹 의무</article></html>'.encode()
        response.text=response.content.decode()
        with patch('collectors.generic_web.public_url',side_effect=lambda u:u), patch('requests.get',return_value=response):
            result=collect_url('https://www.ftc.go.kr/detail')
            self.assertEqual(result.status,'연결됨')
            self.assertEqual(result.items[0]['body'],'편의점 가맹 의무')
            response.headers={'Content-Type':'application/rss+xml'}
            response.content=b'<rss version="2.0"><channel><title>News</title><item><title>Retail</title><description>Guide</description><link>https://www.ftc.go.kr/x</link></item></channel></rss>'
            self.assertEqual(collect_url('https://www.ftc.go.kr/rss').items[0]['source_type'],'RSS')
        self.assertEqual(collect_url('http://127.0.0.1:11434').status,'오류')

if __name__=='__main__': unittest.main()
