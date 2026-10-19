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
