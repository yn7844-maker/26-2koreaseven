import render0, { scene as scene0 } from "./line-chart.js";
import render1, { scene as scene1 } from "./horizontal-bar.js";
import render2, { scene as scene2 } from "./vertical-bar.js";
import render3, { scene as scene3 } from "./scatter.js";
import render4, { scene as scene4 } from "./dumbbell.js";
import render5, { scene as scene5 } from "./ring-gauge.js";
import render6, { scene as scene6 } from "./treemap.js";
import render7, { scene as scene7 } from "./funnel.js";
import render8, { scene as scene8 } from "./ranking.js";
import render9, { scene as scene9 } from "./progress-bar.js";
import render10, { scene as scene10 } from "./kpi-counter.js";
import render11, { scene as scene11 } from "./before-after.js";
export const chartRegistry = {
  line: { render: render0, scene: scene0 },
  "horizontal-bar": { render: render1, scene: scene1 },
  "vertical-bar": { render: render2, scene: scene2 },
  scatter: { render: render3, scene: scene3 },
  dumbbell: { render: render4, scene: scene4 },
  "ring-gauge": { render: render5, scene: scene5 },
  treemap: { render: render6, scene: scene6 },
  funnel: { render: render7, scene: scene7 },
  ranking: { render: render8, scene: scene8 },
  "progress-bar": { render: render9, scene: scene9 },
  "kpi-counter": { render: render10, scene: scene10 },
  "before-after": { render: render11, scene: scene11 },
};
