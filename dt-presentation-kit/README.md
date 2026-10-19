# Seven Eleven DT Presentation Kit

설정과 데이터로 반복 생성하는 모션 프레젠테이션·편집형 PPTX 도구. 데모의 모든 숫자는 가상 데이터이며 실제 회사 실적과 무관합니다.

## Installation

Node.js 22.12 이상(검증 환경: 24)을 설치하세요. 터미널에서 이 폴더로 이동한 다음 실행합니다.

```sh
npm install
```

다른 환경에서 잠금 파일 그대로 설치하려면 `npm ci`를 사용합니다.

## Run

```sh
npm run dev
```

터미널에 표시된 개발 서버 주소를 브라우저에서 엽니다. 배포 파일은 `npm run build`로 `dist/`에 생성됩니다. ES Module을 사용하므로 HTML 파일을 직접 더블클릭하지 마세요.

## Change Text

`data/sample-presentation.js`의 `title`, `subtitle`, `insights` 등을 수정합니다. 화면의 **현재 장표 JSON 편집**으로 수정하고 **JSON 저장**으로 보관할 수도 있습니다. 화면 수정은 서버의 원본 파일을 덮어쓰지 않습니다.

## Change Data

동일 파일에서 `chart.data`만 바꾸면 축 범위가 자동 갱신됩니다. 브라우저 개발자 도구에서 `presentationKit.changeChartData('trend', [{label:'1Q',value:100},{label:'2Q',value:150}])`도 사용할 수 있습니다. 대시보드는 세 번째 인자로 차트 인덱스(0부터)를 전달합니다. **JSON 불러오기**는 저장한 전체 프레젠테이션 또는 `{ "slides": [...] }`를 읽습니다.

## Change Theme

`src/config/presentation.config.js`에서 `theme: {...tokens, colors: {...tokens.colors, primary:'#194D45'}, fontFamily:'Arial'}`처럼 설정합니다. Primary·Accent·Font UI로도 즉시 변경할 수 있습니다. JSON 저장 후 다시 불러오면 유지됩니다. Pretendard는 로컬 설치 글꼴을 우선 사용하며 미설치 시 대체 글꼴을 사용합니다. 폰트 파일을 배포하려면 라이선스를 확인하고 `assets/fonts/`와 `typography.css`에 등록하세요.

## Add Slide

`sample-presentation.js` 배열에 고유한 `id`를 가진 객체를 추가합니다. 배열 순서가 발표 순서입니다. 삭제는 객체를 제거하면 됩니다. `docs/COMPONENTS.md`에서 유형별 필드를 확인하세요.

## Change Chart

`chart.type`과 해당 유형의 `data`를 바꿉니다. 유형·필드 목록은 `docs/CHART_LIBRARY.md`에 있습니다. 잘못된 데이터는 적용을 거절하고 경고합니다.

## Change Animation

기본값은 `presentation.config.js`에서 `animation: {...animation, chartDuration:2400}`처럼 변경합니다. 단위는 밀리초입니다. 개별 차트에는 선택적으로 `animation`을 지정할 수 있습니다. Static은 최종 상태, Presentation은 한 번 재생, Loop는 반복 재생입니다. Play·Pause·Replay와 ←/→, Space, R, F를 지원합니다. 모션 감소 OS 설정에서는 정적 화면으로 시작합니다.

## Export PPTX

샘플 덱을 명령줄에서 생성하려면 `npm run export:demo`를 실행합니다. `exports/presentation.pptx`에 저장됩니다.

**Export PPTX**를 누르면 현재 내용과 테마로 `presentation.pptx`가 다운로드됩니다. 제목·본문·KPI·도형·표와 주요 차트는 편집 가능합니다. HTML 모션은 포함하지 않으며 최종 값을 출력합니다. 실제 PowerPoint에서 글꼴 대체·줄바꿈·배치를 최종 확인하세요. `docs/PPTX_EXPORT.md`를 참고하세요.

## Troubleshooting

- 빈 화면: `npm run dev`로 실행했는지, 터미널 오류를 확인하세요.
- 데이터 오류: 숫자를 문자열로 넣지 마세요. `label`과 차트별 필수 필드가 필요합니다.
- 넘침 경고: 문구·항목을 줄이거나 여러 장으로 나누세요. 무조건 작은 글씨로 줄이지 않습니다.
- 전체 화면: 버튼을 직접 누르세요. 브라우저 정책으로 거부되면 경고가 표시됩니다.
- PPT 글꼴 차이: 발표 PC에 동일한 글꼴을 설치하거나 Arial로 변경하세요.
- 파일 가져오기 실패: 전체 덱은 `meta/theme/animation/slides`, 데이터 전용은 `slides` 구조를 사용하세요.
- 로고: `theme.logo`에 로컬 공개 경로 또는 data URI를 사용하세요. 외부 이미지는 CORS·네트워크 정책 영향을 받습니다.

## Validation

```sh
npm test
npm run build
npm run test:browser
```

브라우저 테스트는 기본적으로 `/usr/bin/chromium`을 사용합니다. 다른 환경은 `CHROMIUM_PATH`를 지정하거나 `npx playwright install chromium` 후 설정의 executablePath를 조정하세요. Microsoft PowerPoint의 실제 GUI에서 열림·편집 검증은 별도 수동 점검입니다.

## 설치 없는 HTML 출력

`npm run export:html`로 단일 HTML을 생성합니다. 출력은 `exports/Presentation-Kit.html`입니다. HTML 모션은 장표 선택 시 한 번 재생됩니다. Replay는 다시 재생, Loop는 반복입니다. 시스템의 동작 줄이기로 자동 모션이 꺼진 경우 화면에 안내하며, 직접 Play·Replay를 누르면 재생합니다. Static에서도 Play·Replay로 presentation 모드로 전환할 수 있습니다.

## 요청서로 새 덱 생성하기

저장소의 [START_HERE.md](../START_HERE.md)와 AI 프롬프트를 사용합니다. 엔진을 수정하지 않고 자료별 JSON을 생성합니다.

```sh
npm run deck:build -- --input ../presentations/example/deck.json --out exports/example
```

출력은 Presentation.html, presentation.pptx, presentation.json입니다. HTML과 PPTX는 동일한 해석 완료 데이터를 사용합니다. `--input`은 필수이며, 모든 경로는 명령을 실행한 프로젝트 폴더 기준입니다. 원본 데이터는 자동 수정하지 않습니다.
