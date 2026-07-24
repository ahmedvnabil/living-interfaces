function badge(text, state = "idle") {
  const s = document.createElement("span");
  s.className = "la-badge";
  setBadge(s, text, state);
  return s;
}
function setBadge(el, text, state) {
  el.textContent = text;
  el.className = `la-badge${state !== "idle" ? ` la-badge--${state}` : ""}`;
}
function metadataPanel(entries) {
  const dl = document.createElement("dl");
  dl.className = "la-meta";
  update(dl, entries);
  return dl;
}
function update(dl, entries) {
  dl.replaceChildren();
  for (const [k, v] of entries) {
    const dt = document.createElement("dt");
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.textContent = v;
    dl.append(dt, dd);
  }
}
function seedViewer(seed, onCopy) {
  const s = document.createElement("span");
  s.className = "la-seed";
  const label = document.createElement("span");
  label.textContent = "seed";
  label.className = "la-label";
  const code = document.createElement("code");
  code.textContent = formatSeed(seed);
  code.title = "Copy seed";
  code.addEventListener("click", () => {
    navigator.clipboard?.writeText(String(seed)).catch(() => void 0);
    onCopy?.();
  });
  s.append(label, code);
  return s;
}
function setSeed(viewer, seed) {
  const code = viewer.querySelector("code");
  if (code) code.textContent = formatSeed(seed);
}
function formatSeed(seed) {
  return "0x" + seed.toString(16).padStart(8, "0").toUpperCase();
}
function timeline() {
  const el = document.createElement("div");
  el.className = "la-timeline";
  const track = document.createElement("div");
  track.className = "la-timeline__track";
  const cursor = document.createElement("div");
  cursor.className = "la-timeline__cursor";
  track.appendChild(cursor);
  const time = document.createElement("span");
  time.className = "la-timeline__time";
  time.textContent = "T+00:00";
  el.append(track, time);
  return {
    el,
    set(t, duration = 60) {
      const frac = t % duration / duration;
      cursor.style.left = `${(frac * 100).toFixed(2)}%`;
      const m = Math.floor(t / 60), s = Math.floor(t % 60);
      time.textContent = `T+${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
  };
}
function inspector(title, ...sections) {
  const box = document.createElement("div");
  box.className = "la-inspector";
  const head = document.createElement("div");
  head.className = "la-inspector__head";
  const h = document.createElement("span");
  h.className = "la-label";
  h.textContent = title;
  head.appendChild(h);
  const body = document.createElement("div");
  body.className = "la-inspector__body";
  body.append(...sections);
  box.append(head, body);
  return box;
}
export {
  badge,
  formatSeed,
  inspector,
  metadataPanel,
  seedViewer,
  setBadge,
  setSeed,
  timeline,
  update
};
