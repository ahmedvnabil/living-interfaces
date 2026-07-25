const DARK = {
  bg: "#0a0b0c",
  fg: "#f4f5f4",
  muted: "#8a9088",
  faint: "#22262a",
  accent: "#c6ff4d",
  accent2: "#5f7a52"
};
const LIGHT = {
  bg: "#f6f7f5",
  fg: "#111412",
  muted: "#5c635c",
  faint: "#dde1dc",
  accent: "#79a20b",
  accent2: "#a8bd8a"
};
const VARS = {
  bg: "--la-bg",
  fg: "--la-fg",
  muted: "--la-muted",
  faint: "--la-faint",
  accent: "--la-accent",
  accent2: "--la-accent2"
};
function resolveTokens(el, base = DARK) {
  const cs = getComputedStyle(el);
  const out = { ...base };
  for (const key of Object.keys(VARS)) {
    const v = cs.getPropertyValue(VARS[key]).trim();
    if (v) out[key] = v;
  }
  return out;
}
function toTokens(theme) {
  if (theme === "dark") return DARK;
  if (theme === "light") return LIGHT;
  return theme;
}
export {
  DARK,
  LIGHT,
  resolveTokens,
  toTokens
};
