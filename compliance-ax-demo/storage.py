import json
import os
import tempfile
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import pandas as pd
from config import HISTORY, OUTPUTS

class HistoryStore:
    def __init__(self, folder=HISTORY):
        self.folder=Path(folder)
        self.folder.mkdir(parents=True, exist_ok=True)
    def load(self, scope):
        path=self.folder / (self.safe(scope)+'.json')
        return json.loads(path.read_text(encoding='utf-8')) if path.exists() else []
    @staticmethod
    def safe(scope):
        import hashlib
        return hashlib.sha256(scope.encode()).hexdigest()
    def save(self, scope, items):
        path=self.folder / (self.safe(scope)+'.json')
        fd,tmp=tempfile.mkstemp(dir=self.folder, suffix='.tmp')
        try:
            with os.fdopen(fd,'w',encoding='utf-8') as f:
                json.dump(items,f,ensure_ascii=False,indent=2)
            os.replace(tmp,path)
        finally:
            if os.path.exists(tmp): os.unlink(tmp)

def export_pair(items, folder=OUTPUTS):
    folder=Path(folder)
    folder.mkdir(parents=True,exist_ok=True)
    stamp=datetime.now(ZoneInfo('Asia/Seoul')).strftime('%Y%m%d_%H%M%S_%f')
    base=folder / f'compliance_brief_{stamp}'
    csv=base.with_suffix('.csv'); parquet=base.with_suffix('.parquet')
    frame=pd.DataFrame(items)
    try:
        frame.to_parquet(parquet,engine='pyarrow',index=False)
        frame.to_csv(csv,index=False,encoding='utf-8-sig')
    except Exception:
        csv.unlink(missing_ok=True); parquet.unlink(missing_ok=True)
        raise
    return csv,parquet
