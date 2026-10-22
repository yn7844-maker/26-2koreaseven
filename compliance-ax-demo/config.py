from pathlib import Path
import os
from dotenv import load_dotenv
ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / '.env')
HISTORY = ROOT / 'data' / 'history'
OUTPUTS = ROOT / 'outputs'
KEYWORDS = ['가맹', '유통', '공정거래', '점주', '편의점', '개인정보', '표시광고', '전자상거래']
LAW_NAMES = ['가맹사업거래의 공정화에 관한 법률', '대규모유통업에서의 거래 공정화에 관한 법률', '표시ㆍ광고의 공정화에 관한 법률', '전자상거래 등에서의 소비자보호에 관한 법률', '개인정보 보호법']
def setting(name, default=''):
    return os.getenv(name, default).strip()
