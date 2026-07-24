function miniGraph(width = 96, height = 22, capacity = 60) {
  const el = document.createElement("canvas");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  el.width = width * dpr;
  el.height = height * dpr;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  const ctx = el.getContext("2d");
  ctx.scale(dpr, dpr);
  let data = [];
  function draw(values) {
    if (values) data = values.slice(-capacity);
    const cs = getComputedStyle(el);
    const faint = cs.getPropertyValue("--la-faint").trim() || "#22262a";
    const muted = cs.getPropertyValue("--la-muted").trim() || "#8a9088";
    const accent = cs.getPropertyValue("--la-accent").trim() || "#c6ff4d";
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = faint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 0.5);
    ctx.lineTo(width, height - 0.5);
    ctx.stroke();
    if (data.length < 2) return;
    const max = Math.max(...data, 1e-6);
    const min = Math.min(...data, 0);
    const span = max - min || 1;
    ctx.strokeStyle = muted;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i / (capacity - 1) * width;
      const y = height - 2 - (v - min) / span * (height - 5);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    const lx = (data.length - 1) / (capacity - 1) * width;
    const ly = height - 2 - (data[data.length - 1] - min) / span * (height - 5);
    ctx.fillStyle = accent;
    ctx.fillRect(lx - 1.5, ly - 1.5, 3, 3);
  }
  return {
    el,
    push(v) {
      data.push(v);
      if (data.length > capacity) data.shift();
      draw();
    },
    draw
  };
}
function fpsCounter() {
  const el = document.createElement("span");
  el.className = "la-mono";
  el.style.cssText = "font-size:var(--la-text-xs);color:var(--la-muted);min-width:52px;";
  el.textContent = "-- fps";
  return {
    el,
    set(fps) {
      el.textContent = `${String(fps).padStart(2, "0")} fps`;
      el.style.color = fps >= 50 ? "var(--la-muted)" : fps >= 30 ? "var(--la-info)" : "var(--la-danger)";
    }
  };
}
export {
  fpsCounter,
  miniGraph
};
