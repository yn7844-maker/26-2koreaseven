export const hex = (c) => c.replace("#", "");
export const inches = (n) => n / 96;
export function textOptions(item, theme) {
  const t = theme.typography[item.role] || theme.typography.body;
  return {
    x: inches(item.x),
    y: inches(item.y),
    w: inches(item.w),
    h: inches(item.h),
    fontFace: theme.fontFamily.split(",")[0].replaceAll('"', "").trim(),
    fontSize: t.fontSize * 0.75,
    bold: t.fontWeight >= 600,
    color: hex(theme.colors[item.color] || theme.colors.textPrimary),
    margin: 0,
    breakLine: false,
    valign: "top",
    paraSpaceAfterPt: 4,
  };
}
export function exportWarnings(p) {
  const warnings = [];
  for (const s of p.slides) {
    if (s.title?.length > 65)
      warnings.push(`${s.id}: 제목이 깁니다. 줄바꿈과 배치를 확인하세요.`);
    if (s.chart?.data.length > 15)
      warnings.push(`${s.id}: 차트 항목이 많습니다.`);
  }
  return warnings;
}
