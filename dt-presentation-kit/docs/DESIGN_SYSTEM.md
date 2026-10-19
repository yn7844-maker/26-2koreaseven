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
