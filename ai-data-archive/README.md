# Fieldnotes — AI & Data Archive

AI·DATA 인턴의 프로젝트, 실험, 자료, 회고를 기록하는 공개 개인 대시보드입니다.

## 사용 방식

- 방문자: 로그인 없이 모든 저장된 글을 읽고 검색할 수 있습니다.
- 작성자: 우측 상단 **작성 모드**에 관리자 비밀번호를 입력합니다. 계정 가입은 필요 없습니다.
- **새 기록** 또는 템플릿을 눌러 작성하고 **기록 저장**을 누르면 온라인 저장소에 반영됩니다.
- 글을 열면 수정·삭제·Markdown 내려받기를 할 수 있습니다.
- 즐겨찾기, 태그 필터, 본문 검색, 카드/목록 보기, 정렬, 전체 JSON 백업을 지원합니다.
- 작성 도중 내용은 현재 브라우저에 임시 저장됩니다. 이는 온라인 저장이 아닙니다. **기록 저장**을 눌러야 다른 컴퓨터에서 볼 수 있습니다.
- 온라인 기록은 처음 접속할 때, 탭으로 돌아올 때, 열려 있는 동안 60초마다 갱신됩니다. 동시에 같은 글을 수정하면 마지막에 저장한 내용이 반영됩니다.
- 관리자 비밀번호는 브라우저 메모리에만 유지하며 새로고침하면 다시 입력합니다.

## Vercel 배포 (이 저장소 기준)

1. https://vercel.com/new 에서 GitHub 저장소 `yn7844-maker/26-2koreaseven`을 Import 합니다.
2. **Root Directory를 `ai-data-archive`로 설정**합니다. 기존 발표자료 도구 폴더는 선택하지 않습니다.
3. Framework Preset은 **Other**, Build Command는 비워두고, Output Directory는 기본값(프로젝트 루트)을 사용합니다. 별도 빌드나 패키지 설치가 필요 없는 HTML/CSS/JS + Node.js 서버리스 API입니다.
4. 연결된 브랜치에 이 폴더가 있어야 합니다. PR을 병합했다면 기본 `main`, 병합 전이라면 `feat/ai-data-archive-dashboard` 브랜치를 선택합니다.
5. Node.js 버전은 **22.x 또는 24.x**를 사용합니다.
6. 아래 환경 변수를 설정한 뒤 Deploy 합니다. 먼저 설정 없이 배포하면 체험 모드가 열립니다.

### 온라인 저장소 연결

Vercel 프로젝트의 **Storage / Marketplace**에서 **Upstash Redis**를 생성하고 프로젝트에 연결합니다. Integration이 생성한 환경 변수 이름을 확인하세요.

| 환경 변수 | 값 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash 콘솔의 HTTPS REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | 같은 DB의 읽기·쓰기 REST Token |
| `ADMIN_PASSWORD` | 직접 정한 관리자 비밀번호, 12자 이상 |

Upstash Integration이 `KV_REST_API_URL`과 `KV_REST_API_TOKEN`을 생성했다면 앱이 이 이름도 인식합니다. `REDIS_URL` TCP 접속 문자열은 사용하지 않습니다. REST Token은 읽기 전용 토큰이 아닌 읽기·쓰기 토큰이어야 합니다.

값은 **Vercel → Project Settings → Environment Variables**에만 입력하세요. 소스 코드나 GitHub에는 넣지 마세요. Production/Preview 등 사용하려는 배포 환경에 적용하고 **Redeploy** 합니다. 앱 우측 상단에 **온라인 저장**이 표시되는지 확인하세요.

공개 열람은 누구나 가능하지만 쓰기와 삭제 API는 서버에서 관리자 비밀번호를 검증합니다. 비밀번호는 HTTPS 요청의 Authorization 헤더로 전송됩니다. 글에는 공개해도 되는 자료만 올리세요. Upstash 유료 플랜 등을 선택하면 해당 서비스 요금이 발생할 수 있습니다.

### 배포 후 확인

1. 비밀번호 입력 전 기존 기록을 읽을 수 있는지 확인합니다.
2. 작성 모드에서 테스트 기록을 작성해 저장합니다.
3. 다른 컴퓨터 또는 시크릿 창에서 같은 배포 URL을 열고 기록이 보이는지 확인합니다.
4. 비밀번호 없이 수정·삭제를 누르면 관리자 비밀번호를 요청하는지 확인합니다.
5. JSON 백업을 내려받습니다.

## 체험 모드

환경 변수 세 개가 준비되지 않으면 **체험 모드**로 실행됩니다. 내 기록은 빈 상태로 시작하며 수정 내용은 브라우저 localStorage에만 저장됩니다. 작성 예시 한 개를 별도로 열어볼 수 있고, 예시는 내 기록·검색·통계·백업에 포함되지 않습니다. 이전 버전의 기본 예시는 화면에서 제외하며 직접 작성하거나 수정한 글은 보존합니다. 체험 기록은 온라인 DB에 자동 이전되지 않습니다. 먼저 JSON 백업을 내려받고 필요한 글을 온라인 모드에서 다시 작성하세요.

## 로컬 실행

```sh
npm run dev
# http://localhost:3000
```

온라인 모드를 로컬에서 확인하려면 `.env.example`을 참고해 `.env.local`을 만든 뒤:

```sh
node --env-file=.env.local dev.mjs
```

`.env.local`은 Git에서 제외됩니다. 실제 키를 채팅이나 커밋에 남기지 마세요.

```sh
npm test
```

서버에서 공개 조회, 관리자 권한, 입력 검증, 저장·수정·삭제, 저장소 오류를 검증합니다.

## 구조와 운영

- `index.html`, `style.css`, `app.js`: 반응형 대시보드와 글 편집기
- `api/archive.js`: Vercel Node.js 서버리스 API + Upstash REST API
- `vercel.json`: 서버리스 함수와 HTTP 헤더 설정
- `dev.mjs`: 의존성 없는 로컬 개발 서버
- Redis Hash `fieldnotes:entries`: 글별 JSON을 ID로 저장. 앱의 서버리스 파일 시스템에는 쓰지 않습니다.

관리자 비밀번호는 Vercel 환경 변수를 변경하고 다시 배포해 교체합니다. 모든 글은 공개로만 저장되며, 비공개 게시물·이미지 파일 업로드·첨부파일 저장 기능은 포함하지 않습니다. 본문은 일반 텍스트이므로 HTML이 실행되지 않습니다. Markdown 내보내기는 제목·메타데이터·일반 본문을 파일로 저장합니다.

백업은 JSON 및 글별 Markdown 내보내기로 제공하며 앱 내 일괄 복원 기능은 없습니다. 데이터 양이 늘어나면 서버 검색/페이지네이션을 추가하는 것이 좋습니다. 현재 개인 아카이브 규모에서는 모든 글을 불러와 브라우저에서 검색합니다.
