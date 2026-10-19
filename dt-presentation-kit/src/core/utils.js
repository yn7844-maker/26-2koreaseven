export const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
export const fmt = (n) =>
  Number(n).toLocaleString("ko-KR", { maximumFractionDigits: 1 });
export const clone = (x) => structuredClone(x);
export function mergeTheme(base, custom = {}) {
  return {
    ...base,
    ...custom,
    colors: { ...base.colors, ...custom.colors },
    typography: { ...base.typography, ...custom.typography },
    safeArea: { ...base.safeArea, ...custom.safeArea },
  };
}
export function applyTheme(node, t) {
  for (const [k, v] of Object.entries(t.colors))
    node.style.setProperty("--" + k, v);
  node.style.fontFamily = t.fontFamily;
  for (const [k, v] of Object.entries(t.typography)) {
    node.style.setProperty("--" + k + "Size", v.fontSize + "px");
    node.style.setProperty("--" + k + "Weight", v.fontWeight);
    node.style.setProperty("--" + k + "Line", v.lineHeight);
    node.style.setProperty("--" + k + "Spacing", v.letterSpacing + "px");
  }
  for (const [k, v] of Object.entries(t.safeArea))
    node.style.setProperty("--safe-" + k, v + "px");
}
