# QA · 2026-10-19

검증 환경: Node.js 24.19.0, npm 11.9.0, Linux Chromium.

| 항목                 | 결과                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| npm install / npm ci | 성공, package-lock 기반 재설치 확인                                           |
| npm run build        | 성공                                                                          |
| npm test             | 7개 통과, 건너뛴 테스트 없음                                                  |
| npm run test:browser | Chromium 3개 통과                                                             |
| 개발 서버            | index.html 및 src/main.js HTTP 200                                            |
| 데모                 | 22장, 전체 장표 순회·기본 데이터 넘침 없음                                    |
| 차트                 | 12종 데이터 검증·유한 좌표, SVG 표시                                          |
| 탐색                 | 썸네일, 이전·다음, 키보드 이동                                                |
| 모션                 | 재생·정지·재시작, loop, KPI count-up, static 최종값, reduced-motion           |
| 화면                 | 16:9, 작은 viewport 전체 축소, fullscreen                                     |
| 편집                 | 테마·폰트 변경, 데이터 교체, JSON 편집 오류·저장·불러오기, 슬라이드 순서 변경 |
| 경고                 | 잘못된 숫자·범위·누락 필드·장문 overflow                                      |
| PPTX                 | 다운로드, 22장, native text/shape/table/chart와 차트 workbook 확인            |
| Office 호환성        | LibreOffice에서 열기 및 22페이지 PDF 변환 성공, 주요 배치 확인                |

## 수동 확인이 필요한 항목

- Microsoft PowerPoint 실제 프로그램에서 열기·텍스트/표/차트 편집·저장: 이 환경에서는 미실행.
- 발표 PC의 Pretendard 설치 및 글꼴 대체 후 줄바꿈.
- 사용자 지정 로고의 외부 CORS·접근 권한.

HTML과 PPTX는 동일 모델을 사용하지만 native chart의 축·레이블 배치는 Office 렌더러에 따라 다릅니다. 모션은 HTML 전용이며 PPTX는 정적 최종값입니다. 특수 차트는 도형을 편집할 수 있고, native chart 데이터 편집은 line/bar/scatter/ring에 제공됩니다. 데이터 교체 시 기존 insight 문구의 사실관계도 함께 검토하세요.
