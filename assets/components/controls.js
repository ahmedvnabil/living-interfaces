function button(label, onClick, opts = {}) {
  const b = document.createElement("button");
  b.className = opts.primary ? "la-btn la-btn--primary" : "la-btn";
  b.textContent = label;
  if (opts.title) b.title = opts.title;
  b.addEventListener("click", onClick);
  return b;
}
function iconButton(glyph, label, onClick) {
  const b = document.createElement("button");
  b.className = "la-btn la-btn--icon";
  b.textContent = glyph;
  b.setAttribute("aria-label", label);
  b.title = label;
  b.addEventListener("click", onClick);
  return b;
}
function toggle(label, checked, onChange) {
  const wrap = document.createElement("label");
  wrap.className = "la-toggle";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  const track = document.createElement("span");
  track.className = "la-toggle__track";
  track.innerHTML = '<span class="la-toggle__thumb"></span>';
  const text = document.createElement("span");
  text.className = "la-label";
  text.textContent = label;
  input.addEventListener("change", () => onChange(input.checked));
  wrap.append(input, track, text);
  return wrap;
}
function paramSlider(def, onInput) {
  const wrap = document.createElement("div");
  wrap.className = "la-slider";
  const row = document.createElement("div");
  row.className = "la-slider__row";
  const label = document.createElement("span");
  label.className = "la-label";
  label.textContent = def.label;
  const value = document.createElement("span");
  value.className = "la-slider__value";
  const fmt = (v) => def.step < 1 ? v.toFixed(decimals(def.step)) : String(Math.round(v));
  value.textContent = fmt(def.value);
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(def.min);
  input.max = String(def.max);
  input.step = String(def.step);
  input.value = String(def.value);
  input.setAttribute("aria-label", def.label);
  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    value.textContent = fmt(v);
    onInput(v);
  });
  row.append(label, value);
  wrap.append(row, input);
  return wrap;
}
function decimals(step) {
  const s = String(step);
  return s.includes(".") ? Math.min(s.split(".")[1].length, 5) : 0;
}
export {
  button,
  iconButton,
  paramSlider,
  toggle
};
