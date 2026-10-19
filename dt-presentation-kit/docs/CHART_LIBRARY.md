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
