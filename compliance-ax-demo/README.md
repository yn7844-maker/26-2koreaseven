# compliance-ax-demo

편의점·유통기업 준법지원팀용 로컬 Python 3.11 PoC입니다. 사내 시스템·민감정보를 사용하지 않습니다. 샘플 4건은 모두 가상이며 실제 법률 변경이나 제재를 뜻하지 않습니다. 분석은 법률 자문이 아니며 원문과 적용일을 담당자가 확인해야 합니다.

공공/정부 API·공식 웹 → 정규화 → 이력 → 변경 탐지 → Rule Engine → 로컬 Ollama(선택) → 관련성·중요도·영향영역 → 데일리 브리핑 → Streamlit.

## 빠른 실행

Windows: Python 3.11을 설치한 뒤 `run_windows.cmd` 실행. macOS: Python 3.11 설치 후 `bash run_mac.sh` 실행.

```bash
cd compliance-ax-demo
python3.11 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
# Windows에서는 .venv\Scripts\python.exe 사용
.venv/bin/python -m streamlit run app.py --server.address 127.0.0.1
```

샘플 선택 → 수집/분석 → 대시보드·브리핑 확인 → CSV + Parquet 함께 저장. 산출물은 `outputs/`, 이력은 `data/history/`에 저장합니다. 실행 위치와 무관하게 프로젝트 경로를 기준으로 저장합니다. 단일 사용자 로컬 앱이며 동시 이력 쓰기를 지원하지 않습니다.

현재 클라우드에서는 `/workspace/compliance-venv/bin/python`에 Python 3.11과 의존성이 설치되어 있습니다. 실행 디렉터리는 `/workspace/26-2koreaseven/compliance-ax-demo`입니다.

## 왜 공공 API는 사용하고 LLM API는 사용하지 않는가

공공 API는 법령·입법·정부 자료를 수집하기 위한 공식 데이터 인터페이스입니다. 외부 LLM API는 입력 데이터가 외부 AI 서비스로 전달될 수 있으므로 이 PoC에서 사용하지 않습니다.

**공공 데이터 API 사용 가능 + 외부 LLM API 사용 안 함 + 로컬 LLM 선택 사용.** OpenAI·Anthropic·Gemini·Azure OpenAI 등 외부 AI SDK·호출 코드는 없습니다. 수집 API와 AI 추론을 별도 모듈로 분리했습니다.

## 환경변수 및 API 지원 범위

`.env.example`을 `.env`로 복사하고 필요한 값만 직접 입력하세요. 키를 코드·Git·로그에 넣지 마세요. `.env`와 수집 이력·산출물은 Git 제외 대상입니다. 키는 선택 사항이며 미설정 시 샘플과 Rule Engine은 정상 실행됩니다. UI는 키가 있다는 이유만으로 연결됨이라고 표시하지 않습니다.

| 소스 | 구현 | 인증/제한 |
|---|---|---|
| 국가법령정보센터 | DRF `lawSearch.do` 검색, `lawService.do` 본문, 시행일/공포일/법령 ID/개정유형, `LawCollector.history()` 연혁 검색 | `LAW_API_OC`: 승인된 이용자 식별값. 실 API 미검증 |
| 열린국회정보 | `nzmimeepazxkubdpn` 22대 국회의원 발의 법률안: 법률안명·제안자·발의일·위원회·의안 ID/번호·처리상태·상세 링크 | `ASSEMBLY_API_KEY` 필요. 상위 100건, 서비스 승인/필드 실응답 미검증 |
| 공정위 | 공식 URL 지정 시 공통 RSS/HTML 수집 | 전용 API Adapter **placeholder**. `FTC_API_KEY` 예약 변수이며 현재 사용하지 않음 |
| 개인정보위 | 공식 URL 지정 시 공통 RSS/HTML 수집 | 전용 API Adapter **placeholder**. `PIPC_API_KEY` 예약 변수이며 현재 사용하지 않음 |
| Generic Web | 공개 상세 URL 제목·본문·기관·URL·수집일; RSS 자동 판별 | 로그인·JS 렌더링·첨부파일·목록 페이지 자동 순회 미지원 |

공정위 `FTC_SOURCE_URL`, 개인정보위 `PIPC_SOURCE_URL`에는 각 기관 공식 도메인의 RSS 또는 **상세 문서** 주소를 지정합니다. 홈페이지/목록 페이지를 개별 보도자료로 파싱하지 않습니다. 기관별 보도자료·심결·제재·정책·입법예고 전수 수집은 아직 지원하지 않습니다. 전용 API 확인 후 API > RSS > 공식 HTML > 일반 웹 순서로 확장할 구조입니다.

법령 기본 모니터링 예시는 `config.LAW_NAMES`에 있습니다. 현재 UI에서 법령명을 입력해 검색합니다. 법령 상태는 공식 원시 코드·개정유형으로 보관하며 공포/시행예정/개정/폐지 코드의 기관별 완전한 매핑, 조문별 변경이력 API와 국회 제안이유·주요내용 상세 수집은 **미구현**입니다. 빈 상세 필드는 추측해 채우지 않습니다. 국회 현재 상태가 접수/심사 중으로 표시되는 경우 정밀 단계가 확인된 것은 아닙니다.

공식 참고: [법령 Open API](https://open.law.go.kr/), [열린국회정보](https://open.assembly.go.kr/), [공공데이터포털](https://www.data.go.kr/).

## 변경 탐지 및 분석

법령 ID/의안 ID/공식 문서 ID → canonical URL(스킴·호스트 정규화, fragment 제거, 식별 query 유지) → 기관+제목 순서로 SHA256 식별합니다. 공백 정규화 본문과 제목·처리상태·시행일·개정유형 hash를 비교합니다. 법령 ID는 개정 버전의 일련번호보다 우선합니다.

- `NEW`: 처음 관측. `UPDATED`: 본문/상태/메타데이터 변화. `UNCHANGED`: 동일.
- `REMOVED`: 명시적으로 완전한 동일 범위 스냅샷에서만 판정. API 검색은 부분 결과이므로 누락을 삭제로 취급하지 않으며 이전 이력을 유지합니다.
- `EFFECTIVE`: 이전 관측일 이후 시행일이 도래한 경우. `CLOSED`: 관측된 철회/가결/폐기/부결/의결 또는 폐지 전환.
- API 실패는 이력을 갱신하지 않습니다. 최초 관측 때 이미 시행된 법령은 `NEW`입니다. API 원시 상태 코드의 완전한 해석은 별도 확장이 필요합니다.

Rule Engine은 법적 직접 영향 4, 조사/제재 4, 개정/시행 3, 가맹 3, 편의점 2, 개인정보 2, 언론 1점을 가산하고 근거를 표시합니다. 7 이상 상, 4~6 중, 0~3 하. 관련성은 업종 키워드별 2점으로 별도 계산하며 관련 이슈만 보기 필터를 제공합니다. 단순 키워드 방식이라 문맥 오판 가능성이 있습니다. Rule 요약은 본문 앞부분 발췌이며 생성형 요약이 아닙니다.

CSV는 UTF-8-SIG, Parquet은 pyarrow로 동일 DataFrame에서 함께 생성합니다. 저장 실패 시 생성된 쌍을 제거합니다. 파일명은 한국 시간과 마이크로초를 사용합니다.

## 로컬 Ollama

Ollama는 별도 선택 설치입니다. 공식 설치 후 예를 들어 `ollama pull qwen2.5:3b`, `ollama serve`를 실행합니다. 모델은 이 프로젝트가 자동 다운로드하지 않습니다.

`OLLAMA_BASE_URL=http://localhost:11434`, `OLLAMA_MODEL=qwen2.5:3b`. 대시보드에서 로컬 LLM을 선택하면 설치 모델 목록을 조회합니다. HTTP loopback 호스트만 허용하고 AI 요청 redirect를 따르지 않습니다. 원격 SaaS 주소는 거부합니다. 문서 일부만 로컬로 전송하며 JSON 검증/시간초과/연결 실패 시 즉시 Rule 결과를 사용합니다. 실패한 요청의 최대 읽기 대기는 30초입니다. 시스템 정보에서 연결 확인이 가능합니다.

핵심 요약·영향영역·검토 포인트는 로컬 모델이 생성할 수 있습니다. 여러 이슈 브리핑은 중요도순 Rule 집계와 상위 관련 이슈의 로컬 LLM 종합 인사이트를 제공합니다. 종합 실패 시 상위 검토 항목을 Rule 방식으로 표시합니다. 모델 출력도 담당자 검토가 필요합니다.

## 자동 데일리 브리핑

```bash
.venv/bin/python briefing.py --source sample
.venv/bin/python briefing.py --source law --query '개인정보 보호법'
.venv/bin/python briefing.py --source assembly --query '가맹' --ollama
```

CSV·Parquet·Markdown을 함께 저장합니다. 실패는 0이 아닌 종료코드를 반환합니다. OS의 cron(한국 시간 설정) 또는 Windows 작업 스케줄러에서 실행 디렉터리와 Python 절대 경로를 지정해 매일 실행할 수 있습니다. 앱 자체는 상주 스케줄러를 실행하지 않습니다.

## 검증

```bash
.venv/bin/python -m unittest discover -s tests -v
```

실제 검증 기록은 `VALIDATION.md`를 참고하세요. API 모의 응답 테스트는 실서비스 승인을 증명하지 않으며 Ollama 모의 응답은 실제 모델 실행 검증과 다릅니다. Windows cmd는 제공하지만 Linux 환경에서 Windows 실행을 검증했다고 주장하지 않습니다.

## 보안과 GitHub

공공 API/공식 웹 → 로컬 Python → Rule Engine → 로컬 Ollama(선택) → Streamlit loopback 구조입니다. URL 수집은 사설·루프백 IP를 거부하고 각 redirect를 확인합니다. 네트워크 수준 DNS 재바인딩 방어·악성 콘텐츠 정화·대용량 스트리밍 방어를 갖춘 운영용 수집기는 아니므로 승인한 공개 문서만 사용하세요. API 오류 메시지는 키가 포함될 수 있는 원문 URL/예외를 출력하지 않습니다. 이력과 산출물은 로컬 평문입니다.

사내 데이터 연결 전 SSO, 권한관리, 감사로그, 민감정보 마스킹, 저장 암호화, 접근제어, 모델 승인관리가 필요합니다. Streamlit은 기본 loopback으로만 실행합니다.

새 프로젝트 폴더는 저장소 하위에서 독립 동작합니다. 기존 프레젠테이션 소스는 변경하지 않습니다. 업로드 전 `git status --short`, `git diff --check`, `git check-ignore compliance-ax-demo/.env`로 확인하세요. 자동 commit/push는 수행하지 않습니다.

## 다음 고도화

1. 승인된 키·네트워크로 법령/국회 실응답 계약 검증, 페이지네이션·재시도·호출량 관리.
2. 공정위/개인정보위의 실제 공개 API 또는 RSS 어댑터, 문서별 상세 수집.
3. 조문별 변경 이력·법령 상태 매핑·국회 제안이유/정밀 단계.
4. 실제 Ollama 모델의 요약·복수 이슈 종합 인사이트 품질 평가.
5. Windows/macOS 실기기 검증, 운영 보안과 다중 사용자 저장소.
