# 실행 검증 기록

검증일: 2026-10-22 (한국 시간). Python 3.11.17 / Linux x86_64.

| 요청 항목 | 결과와 검증 방법 |
|---|---|
| 키 없음 | 법령/국회 수집기 인증키 미설정 반환. Streamlit 법령 수집 버튼도 안내 표시, 예외 0 |
| 키 있음 가정 | 모의 법령 XML 검색+본문, 국회 JSON 처리 테스트 통과. 실키/승인 없음: 실서비스 성공 미검증 |
| Ollama 없음 | 실제 로컬 모델 목록 빈 배열, 분석은 Rule fallback. 연결 실패/잘못된 JSON fallback 테스트 통과 |
| Ollama 있음 | 모의 정상 JSON로 요약·영향·검토·종합 인사이트 처리 통과. 원격 LLM URL 거부 검증. 실제 Ollama 프로세스/모델 미설치 |
| 샘플 실행 | 가상 4건 UI 수집·분석 및 CLI 두 번 실행 성공 |
| URL 직접 수집 | HTML/RSS 모의 응답과 내부 주소 거부 테스트 통과. 실제 공정위·GitHub URL 수집은 프록시/네트워크 실패를 오류 상태로 처리. 실웹 본문 수집 성공 미확인 |
| CSV + Parquet | 실제 쌍 생성·재읽기 데이터 동등성·CSV BOM 검증, Markdown 브리핑 생성 |
| Delta Detection | NEW/UPDATED/UNCHANGED/REMOVED/EFFECTIVE/CLOSED, 본문 diff, 개정 전후 법령 ID 유지 검증 |
| Windows 실행 | cmd 제공, Python 경로·실패 종료 처리 정적 확인. Windows 머신에서 실행하지 않음. macOS도 실기기 미검증; shell 문법 검사는 통과 |
| GitHub 업로드 준비 | .env/이력/산출물 Git 제외 확인, 기존 추적 파일 수정 없음, diff whitespace 검사 통과. 실제 commit/push 미수행 |

`python -m unittest discover -s tests -v`: **9개 실행, 9개 통과**, skip 없음. Streamlit AppTest가 실제 앱 스크립트에서 샘플 수집·표시·쌍 저장까지 실행했습니다. `uv pip check`: 설치된 42개 패키지 호환성 통과. Streamlit 프로세스 기동 및 내부 health 요청 HTTP 200 / `ok`. health만으로 기능을 판단하지 않고 AppTest 결과를 함께 확인했습니다.

법령(www.law.go.kr), 열린국회정보(open.assembly.go.kr), 공정위(www.ftc.go.kr), 개인정보위(www.pipc.go.kr) 실요청은 ProxyError였습니다. 이것은 API 키 부족과 별개의 네트워크 제한입니다. 초안에 공식 도메인을 저장했으나 현재 런타임 적용/게시/새 작업 복원은 검증되지 않았습니다. 환경 설정에서 초안을 검토·저장하고 게시한 뒤 실제 키와 승인된 서비스로 재검증해야 합니다. 키가 없어도 샘플·규칙 분석 개발은 가능합니다.

설정 초안 저장 항목: install_script, start_skill, 공식기관 5개 허용 도메인, LAW_API_OC/ASSEMBLY_API_KEY 선택 변수 요구사항과 로컬 Ollama 기본 주소/모델. FTC_API_KEY/PIPC_API_KEY는 예약 변수이므로 불필요한 키 요구사항을 등록하지 않았습니다.

남은 범위: 공정위/개인정보위 전용 API, 법령 조문별 이력, 법령 상태 코드 전체 매핑, 국회 상세 제안이유·주요내용 및 정밀 심사 단계·전수 페이지네이션. 시스템 정보/README에서 미연동 상태를 명시합니다. 공공 API 어댑터가 있다는 사실과 실 API 사용 승인이 확인된 상태를 구분합니다.

## 공유용 웹 버전 추가 검증

- `node compliance-ax-demo/web/build.mjs`: 외부 의존성 없이 단일 HTML 빌드 성공.
- Playwright + 실제 시스템 Chromium: **3개 테스트 전부 통과**. 검색/중요도/변경 상태 필터, 상세 창과 본문 diff, 보관함 재로드, Markdown 다운로드 내용, 모바일 가로 넘침 없음, localStorage 차단 시 동작을 확인했습니다.
- 브라우저 요청 관찰: 외부 API/LLM 요청 0건. Python 분석 결과를 미리 만든 가상 fixture만 사용합니다.
- 데스크톱 1440px/모바일 390px 스크린샷을 직접 확인했습니다.
- 기존 Python 테스트도 다시 9개 통과했습니다.
- Vercel용 root `vercel.json`과 설치 없는 정적 빌드를 준비했습니다. Vercel 계정/토큰 연결이 없어 실제 Vercel 게시와 `.vercel.app` 주소 발급은 **미완료**입니다.
- GitHub HTML 공유 서비스(raw.githack.com/rawcdn.githack.com)와 Vercel 웹 접속은 이 런타임의 프록시에서 HTTP tunnel 403으로 제한되었습니다. 공개 링크의 외부 응답을 현재 런타임에서 검증한 것으로 표현하지 않습니다. 해당 도메인 허용을 설정 초안에 추가했으며 현재 런타임에 적용되었다고 주장하지 않습니다.
