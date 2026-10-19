# PPTX Export

공통 layout-model → slide-mapper → PptxGenJS. 크기는 1280/96 × 720/96 inch. HTML은 motion, PPTX는 최종 상태의 static editable deck입니다.

텍스트·KPI는 addText, 카드는 addShape, 표는 addTable. Line/Bar/Scatter/Ring은 native charts와 내장 workbook. Dumbbell/Treemap/Funnel/Progress는 도형과 텍스트. 전체 슬라이드 스크린샷은 사용하지 않습니다. 데이터의 최종값을 출력하므로 재생 중에도 애니메이션 상태에 영향받지 않습니다.

UI의 Export PPTX는 `presentation.pptx` 다운로드. JS 사용: `createPptx(presentation)` → `{pptx,warnings}`, Node에서 `pptx.writeFile({fileName:'...'})` 가능.

출처·주석·로고도 매핑됩니다. 로고는 로컬 경로/data URI 권장. 폰트는 임베딩하지 않으므로 받는 PC에 설치하거나 Arial을 선택하세요. 특수 차트는 개별 도형을 편집할 수 있지만 native chart data editor는 제공하지 않습니다.

자동 검증: ZIP 내 slide XML, native chart 및 workbook, table과 text/shape 존재 확인. 실제 Microsoft PowerPoint에서 열기·편집·저장하기, 줄바꿈·표·로고·축 확인은 수동 검수 항목입니다. 브라우저와 PowerPoint 간 픽셀 일치는 보장하지 않습니다.
