---
name: create-presentation
description: Create a reusable, design-system-based motion HTML presentation and editable static PPTX from a user brief in this repository.
---

# Create presentation

Read repository-root AGENTS.md and START_HERE.md. Paths below are relative to the repository root.

1. Read dt-presentation-kit/docs/DESIGN_SYSTEM.md, CONTENT_GUIDE.md, COMPONENTS.md and CHART_LIBRARY.md.
2. Gather the brief using ai-kit/templates/brief.md. Reuse information already supplied. Ask only for inputs that block useful work. Never invent company results or sources.
3. For a new deck, present slide order, one key message per slide, chart/layout choices and missing inputs. Get outline confirmation unless already authorized. Routine corrections and data swaps do not require repeated approval.
4. Save presentations/<slug>/brief.md and deck.json. Follow presentations/example/deck.json. Theme and animation accept partial overrides; engine defaults fill remaining fields. Keep engine code unchanged for routine authoring.
5. From dt-presentation-kit run npm ci if needed, then npm run deck:build -- --input ../presentations/<slug>/deck.json --out exports/<slug>.
6. Check actual HTML slide count, navigation, animation, overflow and data/source consistency. Inspect generated PPTX text/table/chart objects. If available, open/convert using LibreOffice. Do not claim a Microsoft PowerPoint GUI check unless performed.
7. Report HTML/PPTX/JSON paths, checks and limitations. PPTX is static, HTML is animated. Publish or push only within the user's authorized scope.

For source or motion changes run npm test, npm run test:browser and npm run build. Use existing checkouts; no worktree unless requested.
