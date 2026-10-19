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
