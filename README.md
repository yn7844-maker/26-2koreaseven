# Seven Eleven DT Presentation Kit

설정 기반 모션 프레젠테이션과 편집 가능한 PPTX 생성 도구입니다. 데모 수치는 가상 데이터입니다.

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
- 단위 테스트 7개, Chromium 테스트 3개 통과
