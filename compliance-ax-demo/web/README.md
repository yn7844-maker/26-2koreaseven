# Compliance AX · 공유용 웹 데모

다른 사람이 설치나 로그인 없이 가상 분석 결과를 탐색할 수 있는 정적 웹 버전입니다. 기존 Python/Streamlit 앱과 함께 유지합니다.

- 이슈 모니터링, 제목/본문/영향영역 검색, 중요도·상태·관련성 필터
- 첫 수집 / 변경 발생 시나리오, 본문 diff, 신규·변경·동일·처리 완료·수집 범위 제외
- 분석 근거, 영향 영역, 준법 검토 포인트 상세 보기
- 브라우저별 검토 보관함, Markdown 브리핑 다운로드
- 데스크톱·모바일 반응형 화면, 키보드 상세 창 조작
- 외부 LLM·공공 API·방문자 PC의 Ollama 호출 없음

**실시간 수집 앱이 아닙니다.** 공개된 가상 데이터만 표시합니다. Rule Engine은 기존 Python 구현으로 시나리오를 미리 분석합니다. 브라우저에서 필터/시나리오/화면을 바꾸며, 실제 데이터 수집이나 LLM 추론을 흉내 내지 않습니다. 보관함은 이 브라우저에만 저장되며 타인과 동기화하지 않습니다. CSV는 이 공유 화면에서 생성하지 않으므로 CSV/Parquet 원칙은 변경하지 않습니다.

## Vercel

저장소 루트의 `vercel.json`이 이 웹 데모를 지정합니다. 프로젝트 Root Directory는 **저장소 루트**로 둡니다.

| 항목 | 값 |
|---|---|
| GitHub | yn7844-maker/26-2koreaseven |
| 브랜치 | compliance-ax-demo |
| Framework | Other / null |
| Install Command | 비어 있음 (운영 의존성 없음) |
| Build Command | `node compliance-ax-demo/web/build.mjs` |
| Output Directory | `compliance-ax-demo/web/public` |
| Environment Variables | 필요 없음 |

[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyn7844-maker%2F26-2koreaseven%2Ftree%2Fcompliance-ax-demo)

이 링크는 Vercel 계정에서 프로젝트를 생성하는 화면입니다. 실제 `.vercel.app` 주소는 계정에서 생성 완료 후 발급됩니다. 이 작업 환경에는 Vercel 인증 연결이 없으므로 GitHub 업로드와 빌드를 실제 Vercel 게시 완료로 표현하지 않습니다.

일반 정적 호스트나 GitHub HTML 프리뷰 서비스도 `public/index.html` 한 파일만으로 사용할 수 있습니다. HTML에 CSS·코드·가상 데이터가 함께 들어 있어 상대 경로/CORS/외부 CDN 라이브러리에 의존하지 않습니다. GitHub에서 HTML 파일만 다운로드해 로컬 브라우저로 열 수도 있습니다.

## 빌드와 개발

저장소 루트에서, Node 20 이상:

```sh
node compliance-ax-demo/web/build.mjs
python3 -m http.server 8765 --directory compliance-ax-demo/web/public
```

빌드는 npm 설치나 Python 없이 동작합니다. `src/`와 `data/demo.json`을 결합해 `public/index.html`을 생성합니다. 생성 HTML은 Git에 함께 포함해 브라우저 공유·다운로드가 가능합니다.

원본 Python 규칙이 변경되면 **선택적으로** Python 의존성을 설치한 환경에서 가상 데이터만 다시 만듭니다:

```sh
python compliance-ax-demo/web/generate_data.py
node compliance-ax-demo/web/build.mjs
```

실제 키나 수집 데이터를 fixture에 넣지 마세요. 원본 fixture는 가상 문서만 사용합니다.

## 검증

```sh
npm ci --prefix compliance-ax-demo/web
npm test --prefix compliance-ax-demo/web
```

브라우저 테스트는 시스템 Chromium을 사용합니다. 다른 환경에서는 `CHROMIUM_PATH`로 설치 경로를 지정합니다. 테스트 설정은 내부 HTTP 서버를 자동 시작합니다. 첫 수집·검색·중요도 필터·본문 diff·모든 변경 상태·보관함 재로드·다운로드 내용·모바일 overflow·브라우저 저장 차단을 검사합니다. 네트워크 요청 관찰로 데모가 외부 API를 호출하지 않는지도 확인합니다.

Vercel용 CSP는 외부 연결을 차단합니다. 공개 데모에는 인증정보와 민감정보를 넣지 않았으며, 시스템 정보에서 지원 범위를 표시합니다.
