# 04-validate-export

presentations/<slug>/deck.json을 읽고 기존 deck:build 명령으로 exports/<slug>에 HTML·PPTX·JSON을 생성해줘. 원본 데이터를 고치지 말고 오류가 있으면 정확히 보고해줘.

검증: 실제 장표 수, 빈·NaN·음수 범위, 축·단위·기간, 출처, 본문과 insight의 수치 일치, 제목·본문·표 넘침, HTML 장표 이동·모션, PPTX native 텍스트·표·도형·차트 구조. 사용할 수 있으면 LibreOffice 열기/변환도 확인해줘. PowerPoint에서 직접 열지 않았다면 미검증으로 표시해. 외부 업로드는 별도 승인 없이 하지 마.
