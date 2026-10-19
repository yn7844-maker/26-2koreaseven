# Seven Eleven DT Presentation Kit

설정 기반 모션 프레젠테이션과 편집 가능한 PPTX 생성 도구입니다. 데모 수치는 가상 데이터입니다.

## AI로 새 발표자료 만들기

**[여기서 시작하세요 → START_HERE.md](START_HERE.md)**

디자인 시스템 + 모션 차트 키트를 AI에 제공하고, 요청서에 따라 반복 제작하는 구조입니다.

| 경로                                                | 역할                                                |
| --------------------------------------------------- | --------------------------------------------------- |
| `ai-kit/`                                           | AI에 제공할 통합 문서, 요청서 양식, 단계별 프롬프트 |
| `AGENTS.md` / `.agents/skills/create-presentation/` | Codex용 작업 지침과 저장소 스킬                     |
| `CLAUDE.md`                                         | Claude Code용 진입 지침                             |
| `presentations/`                                    | 자료별 요청서와 JSON 원본                           |
| `dt-presentation-kit/`                              | 공통 디자인·차트·모션·PPTX 엔진                     |
| `downloads/`                                        | 내려받아 사용하는 완성 파일                         |

[8장 JSON 예제](presentations/example/deck.json) · [Claude에 첨부할 통합 문서](ai-kit/AI_CONTEXT.md) · [AI 문서 묶음 ZIP](downloads/AI-Authoring-Kit.zip)

```sh
cd dt-presentation-kit
npm ci
npm run deck:build -- --input ../presentations/example/deck.json --out exports/example
```

동일한 JSON으로 독립 실행 HTML과 편집 가능한 정적 PPTX가 함께 생성됩니다. 실제 회사 데이터는 사용자가 제공하며, 예제는 가상 수치입니다. 특정 Claude 전용 기능이나 플러그인은 필요하지 않습니다.

## 설치 없이 사용하기

1. **[실행 파일 ZIP 다운로드](https://github.com/yn7844-maker/26-2koreaseven/raw/refs/heads/main/downloads/DT-Presentation-Kit.zip)**
2. ZIP 압축을 해제합니다.
3. `Presentation-Kit.html`을 Chrome에서 엽니다. Node.js 설치나 터미널 명령은 필요 없습니다.
4. 장표 선택·재생·JSON 편집 후 **Export PPTX**를 누릅니다.
5. 수정한 내용은 **JSON 저장**으로 보관하고 다음 실행 시 **JSON 불러오기**로 복원합니다.

**[완성된 데모 PPTX 다운로드](https://github.com/yn7844-maker/26-2koreaseven/raw/refs/heads/main/downloads/presentation.pptx)**

파일 페이지가 열리면 **Download raw file** 버튼을 사용하세요. 회사 PC의 보안 정책이 로컬 HTML 실행을 제한할 수 있습니다. 실제 Microsoft PowerPoint의 글꼴·편집은 최종 확인이 필요합니다.

## 소스 코드로 실행하기

Node.js 22.12 이상이 필요합니다. 검증 환경은 Node.js 24입니다.

```sh
cd dt-presentation-kit
npm ci
npm run dev
```

자세한 사용법은 [프로젝트 README](dt-presentation-kit/README.md), 검증 결과는 [QA 문서](dt-presentation-kit/docs/QA.md)를 참고하세요.

- 22장 데모, 12종 차트
- 테마·데이터·모션 분리
- 편집 가능한 텍스트·표·도형·주요 네이티브 차트를 포함한 PPTX
- 단위 테스트 9개, Chromium 테스트 4개 통과
