# AI Presentation Authoring Context

통합 문서입니다. 원본은 각 파일 경로를 참고하세요. npm run ai:pack으로 갱신합니다.


---

원본: START_HERE.md

# AI로 반복 제작하는 발표자료

이 저장소는 모션 차트 라이브러리, 디자인 시스템, AI 제작 절차, 편집형 PPTX 출력을 함께 관리합니다. Codex는 이 저장소를 읽고 파일 생성·실행·검증을 수행할 수 있습니다. Claude에서도 같은 문서와 데이터 형식으로 사용할 수 있습니다. Claude 웹은 프로젝트 지식에 문서를 넣고, 파일 실행·출력은 해당 세션에서 사용 가능한 도구에 따라 수행합니다.

## 처음 한 번: 디자인 시스템과 키트 준비

1. [DESIGN_SYSTEM.md](dt-presentation-kit/docs/DESIGN_SYSTEM.md)를 기준으로 컬러·폰트·그리드를 정합니다.
2. [차트 라이브러리](dt-presentation-kit/docs/CHART_LIBRARY.md)와 [슬라이드 컴포넌트](dt-presentation-kit/docs/COMPONENTS.md)를 확인합니다.
3. 이후 자료마다 엔진을 다시 만들지 않고 `presentations/<이름>/deck.json`을 추가합니다.

## 자료를 만들 때마다

1. [요청서 양식](ai-kit/templates/brief.md)을 복사해 주제·독자·결정·데이터·출처를 작성합니다.
2. Codex에 [시작 프롬프트](ai-kit/prompts/01-create-deck.md)와 요청서를 제공합니다. 먼저 목차·핵심 메시지를 검토한 후 제작합니다.
3. AI가 디자인 시스템 안에서 장표와 차트를 선택해 `deck.json`을 생성합니다.
4. AI가 아래 명령으로 HTML과 PPTX를 함께 만들고 검증합니다.
5. 브라우저 모션·넘침을 확인하고, PowerPoint에서 최종 편집·글꼴을 확인합니다.

```sh
cd dt-presentation-kit
npm ci
npm run deck:build -- --input ../presentations/example/deck.json --out exports/example
```

출력: `exports/example/Presentation.html`, `exports/example/presentation.pptx`, `exports/example/presentation.json`.
HTML은 Chrome에서 열어 Replay/Loop로 모션을 봅니다. PPTX는 편집 가능한 정적 최종 상태입니다. 화면을 캡처해 PPT로 붙이는 방식은 사용하지 않습니다.

## Codex에 그대로 전달하기

> 이 저장소의 AGENTS.md와 START_HERE.md, 디자인 시스템을 읽어줘. ai-kit/templates/brief.md 형식의 아래 요청으로 presentations/<자료명>/deck.json을 만들어줘. 먼저 장표 목차·핵심 메시지·필요 데이터를 제시하고 내 확인 후 생성해줘. 확인 후에는 deck:build로 HTML과 PPTX를 만들고 검증 결과와 파일 위치까지 알려줘. [요청 내용]

단순 수정·데이터 교체처럼 이미 범위가 정해진 요청은 확인 단계를 반복하지 않습니다.

## Claude에서 사용하기

[AI_CONTEXT.md](ai-kit/AI_CONTEXT.md), 요청서, [JSON 예제](presentations/example/deck.json)를 제공합니다. Claude Code에서는 CLAUDE.md를 시작점으로 사용합니다. Claude 웹 프로젝트 기능은 문서 보관 수단이며, Codex가 그 기능을 그대로 제공한다고 가정하지 않습니다. 공통 계약은 문서·JSON·파일 출력입니다.

## 결과물 보관

실제 자료는 `presentations/<자료명>/`에 요청서와 JSON을 보관합니다. 생성물은 기본적으로 Git에서 제외되는 `exports/`에 둡니다. GitHub 업로드는 사용자가 지정한 파일·저장소 범위에서만 수행합니다. 회사 자료는 사내 허용 저장소에서 관리하세요.

## 바로 확인할 실행 예제
[8장 예제 다운로드](downloads/AI-Workflow-Example.zip) 후 압축을 풀고 Presentation.html을 Chrome에서 엽니다. 같은 데이터의 presentation.pptx와 presentation.json도 들어 있습니다.


---

원본: dt-presentation-kit/docs/DESIGN_SYSTEM.md

# DT Presentation Kit — Design System

## 1. Philosophy

기업 내부 보고용 정보 구조를 우선한다. 한 장의 핵심 메시지는 하나. 구성 요소는 표·차트·박스로 구조화하고 장식 이미지를 최소화한다. Content / Design / Motion / Export를 분리한다.

## 2. Color Tokens

정의: `src/config/design.tokens.js`. primary는 브랜드와 주요 차트, primaryDark/Light는 강도·카드, secondary는 비교 기준, accent는 강조, textPrimary/Secondary/Muted는 정보 위계, background는 작업 공간, surface는 슬라이드, border는 구분선, positive/negative는 상태에 사용한다. 기본 primary는 #193B53, accent는 #2A9987. darkBackground/darkText는 독립 dark variant용이다. 렌더러에서 색상을 직접 정의하지 않는다. 브랜드 변경은 presentation.config.js의 theme에서만 수행한다.

## 3. Typography

Pretendard → Noto Sans KR → Arial → sans-serif. display 64, title 38, sectionTitle 46, subtitle 19, body 20, caption 13, kpiLarge 64, kpiMedium 40, tableHeader/tableBody 17px. 각 토큰은 fontFamily/fontSize/fontWeight/lineHeight/letterSpacing을 가진다. PowerPoint에서는 px × 0.75 pt로 매핑한다. 글꼴은 자동 임베딩하지 않는다.

## 4. Grid

1280×720 고정 좌표, 16:9. 기본 safe area top 52/right 64/bottom 48/left 64. 제목 영역 y54, 콘텐츠 y190~620, 출처 y658. 레이아웃 좌표는 `layout-model.js`에서 중앙 관리한다. 브라우저가 작으면 전체 장표를 축소하고 내부 구성은 재배치하지 않는다.

## 5. Spacing

4,8,12,16,24,32,40,48,64 토큰. 카드 간 20~24px, 내부 24~28px. 새로운 레이아웃은 safe area와 이 간격 체계를 기준으로 모델에 추가한다.

## 6. Components

title, section, key-message, kpi, chart-insight, full-chart, comparison, three-column, process, timeline, table, dashboard, conclusion. 핵심 문구는 제목→설명→본문→출처 순으로 구분한다. 제목은 두 줄 이내, 포인트는 2~3개 권장. 장문은 경고 후 내용 축약·슬라이드 분리를 우선한다.

## 7. Charts

SVG, 얇은 grid, 최소 잉크, 명시적 label과 단위. 축은 데이터로 자동 계산하고 막대는 0 기준을 포함한다. 데이터가 없는 차트를 장식용으로 생성하지 않는다. 구성비 차트는 음수를 거절한다. 출처는 장표 하단에 배치한다.

## 8. Motion

기본 총 8000ms, intro 500ms, chart 1800ms, stagger 120ms, hold 4000ms. config의 중앙 값을 사용한다. static 최종 상태, presentation 1회, loop 반복. 모션 감소 설정 존중. 이동 시 이전 animation을 해제한다. 차트별 override는 공통 설정과 합성한다.

## 9. Dark Mode

slide.variant='dark'를 지정한다. darkBackground/darkText를 surface/text에 매핑한다. 내보내기도 동일한 변형 테마를 사용한다.

## 10. PPT Export Rule

16:9 정적 편집형. 텍스트·박스·표는 native object. 주요 차트는 native chart, 특수 차트는 도형 조합. 전체 슬라이드 캡처 금지. 공통 layout-model로 좌표를 공유하되 PowerPoint 글꼴 차이는 최종 검수한다.


---

원본: dt-presentation-kit/docs/CONTENT_GUIDE.md

# 실무 보고 Content Guide

1. 완전 문장보다 핵심 단어·구 중심.
2. 조사와 불필요한 완전 문장 최소화.
3. 본문은 핵심 메시지, 근거·세부 기준·사례는 별첨.
4. 병렬 항목은 `/`보다 쉼표 우선.
5. 단계 흐름은 →, 보충 설명은 * 사용 가능.
6. '검토 가능', '추후 검토', '확인 필요' 같은 소극적 표현 남용 금지. 미확정 사실은 숨기지 말고 상태·담당·기한 명시.
7. 장식 이미지보다 표·구조화된 박스·프로세스 우선.
8. 헤더와 핵심 메시지 위계 구분.
9. 정보 밀도가 낮은 광고형 대신 실무 보고서형 구성.
10. 수치 단위·기간·출처 명시. 가상 수치는 시연용이라고 표시.
11. 제목 1~2줄, 포인트 2~3개, 과정 3~6단계 권장. 넘침 경고가 나오면 먼저 내용을 줄이거나 장표 분리.

예: '다양한 디지털 혁신을 진행하고 있습니다' → '매장 자동화 240개점 확대'. 단, 근거 없는 수치·확정 표현 생성 금지.


---

원본: dt-presentation-kit/docs/COMPONENTS.md

# Slide Components

각 슬라이드는 고유 id, type, title, 선택적 subtitle/source/note를 사용합니다.

| type                      | 추가 필드                                             |
| ------------------------- | ----------------------------------------------------- |
| title                     | eyebrow, subtitle, description                        |
| section                   | number, description                                   |
| key-message / conclusion  | statement, points (2~3개 권장)                        |
| kpi                       | kpis: [{label,value,unit,delta}] (3~4개 권장)         |
| chart-insight             | chart, insights                                       |
| full-chart                | chart                                                 |
| comparison / three-column | columns: [{title,body}]                               |
| process / timeline        | steps: [{title,body}] (3~6개)                         |
| table                     | headers, rows, highlightCells: [[행,열]] (본문 0부터) |
| dashboard                 | charts: [chart,…] (2~6개), variant: 'dark' 선택       |

`slides/*`는 단독 렌더러로 재사용 가능하며, 공통 모델은 `core/layout-model.js`, HTML 렌더러는 `slide-engine.js`입니다. 복합 KPI+Line은 dashboard에서 두 컴포넌트를 조합합니다. timeline의 title에 월·분기를 넣고 body에 milestone을 적습니다.


---

원본: dt-presentation-kit/docs/CHART_LIBRARY.md

# Chart Library

모든 렌더러: `(container, options, theme)` → `{destroy()}`. 업데이트는 `PresentationEngine.changeChartData`를 사용하며 이전 SVG를 교체합니다. `chart.source` 또는 `slide.source`로 출처를 지정합니다.

| type           | data의 행 필드           | motion            | PPTX                 |
| -------------- | ------------------------ | ----------------- | -------------------- |
| line           | label,value              | 선 그리기·점 등장 | native line          |
| horizontal-bar | label,value              | 좌→우             | native bar           |
| vertical-bar   | label,value              | 아래→위           | native column        |
| scatter        | label,x,y,size?          | 점 등장           | native scatter       |
| dumbbell       | label,before,after       | 연결선·점 순차    | 도형                 |
| ring-gauge     | label,value,max          | 원주·숫자         | native doughnut+text |
| treemap        | label,value              | tile 등장         | 도형                 |
| funnel         | label,value              | 단계별 등장       | 도형                 |
| ranking        | label,value              | 순위별 bar 등장   | native bar           |
| progress-bar   | label,value,max          | bar grow          | 도형                 |
| kpi-counter    | label,value,unit?        | count-up          | text                 |
| before-after   | label,before,after,unit? | 비교값 등장       | text                 |

숫자는 유한한 number. label은 비어 있지 않은 문자열. ring/progress는 0≤value≤max, max>0. treemap/funnel은 음수 금지, 최소 하나의 양수. Line/bar는 음수를 허용합니다. KPI+Line과 dark dashboard는 위 차트를 재사용하는 복합형입니다. 차트별 `animation` 객체로 중앙 timing을 override할 수 있습니다.


---

원본: dt-presentation-kit/docs/PPTX_EXPORT.md

# PPTX Export

공통 layout-model → slide-mapper → PptxGenJS. 크기는 1280/96 × 720/96 inch. HTML은 motion, PPTX는 최종 상태의 static editable deck입니다.

텍스트·KPI는 addText, 카드는 addShape, 표는 addTable. Line/Bar/Scatter/Ring은 native charts와 내장 workbook. Dumbbell/Treemap/Funnel/Progress는 도형과 텍스트. 전체 슬라이드 스크린샷은 사용하지 않습니다. 데이터의 최종값을 출력하므로 재생 중에도 애니메이션 상태에 영향받지 않습니다.

UI의 Export PPTX는 `presentation.pptx` 다운로드. JS 사용: `createPptx(presentation)` → `{pptx,warnings}`, Node에서 `pptx.writeFile({fileName:'...'})` 가능.

출처·주석·로고도 매핑됩니다. 로고는 로컬 경로/data URI 권장. 폰트는 임베딩하지 않으므로 받는 PC에 설치하거나 Arial을 선택하세요. 특수 차트는 개별 도형을 편집할 수 있지만 native chart data editor는 제공하지 않습니다.

자동 검증: ZIP 내 slide XML, native chart 및 workbook, table과 text/shape 존재 확인. 실제 Microsoft PowerPoint에서 열기·편집·저장하기, 줄바꿈·표·로고·축 확인은 수동 검수 항목입니다. 브라우저와 PowerPoint 간 픽셀 일치는 보장하지 않습니다.
