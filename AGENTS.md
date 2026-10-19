# Presentation authoring instructions

Read START_HERE.md and dt-presentation-kit/docs/DESIGN_SYSTEM.md before authoring decks. Follow dt-presentation-kit/docs/CONTENT_GUIDE.md, COMPONENTS.md and CHART_LIBRARY.md.

- Store each presentation as presentations/<slug>/brief.md and deck.json. Reuse the current engine and semantic theme tokens.
- For a new deck whose outline is not yet approved, propose slide order, one key message per slide and missing inputs first. Implement after the user confirms. Existing authorization, small changes and data swaps do not need repeated confirmation.
- Never invent company results or sources. Clearly label fictional demo data. Missing required numbers need user input or an explicit non-numeric slide.
- Keep content, design and motion separate. For normal authoring, edit the deck JSON; change engine code only for requested capability changes.
- Use the existing checkout; do not create Git worktrees unless requested.
- Run npm run deck:build -- --input ../presentations/<slug>/deck.json --out exports/<slug> from dt-presentation-kit. It generates standalone HTML, editable static PPTX and resolved JSON.
- Verify actual generated outputs. HTML supports motion; PPTX is static and editable. Do not promise native PowerPoint animations, pixel identity or a PowerPoint GUI check that was not performed.
- For engine changes run npm test, npm run test:browser and npm run build. For content changes check data validity, text overflow, chart scales, source notes and generated slide count.
- Report output locations, checks and limitations. Do not publish or push a new deck unless authorized for that material and destination.
