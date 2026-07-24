function tooltip() {
  const el = document.createElement("div");
  el.className = "la-tooltip";
  document.body.appendChild(el);
  const cleanups = [];
  return {
    attach(target, text) {
      const show = (e) => {
        el.textContent = text;
        el.style.left = `${Math.min(e.clientX + 12, innerWidth - 270)}px`;
        el.style.top = `${e.clientY + 14}px`;
        el.classList.add("la-tooltip--visible");
      };
      const hide = () => el.classList.remove("la-tooltip--visible");
      target.addEventListener("mousemove", show);
      target.addEventListener("mouseleave", hide);
      cleanups.push(() => {
        target.removeEventListener("mousemove", show);
        target.removeEventListener("mouseleave", hide);
      });
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      el.remove();
    }
  };
}
function contextMenu(items) {
  const el = document.createElement("div");
  el.className = "la-context";
  el.setAttribute("role", "menu");
  for (const item of items) {
    const b = document.createElement("button");
    b.textContent = item.label;
    b.setAttribute("role", "menuitem");
    b.addEventListener("click", () => {
      close();
      item.action();
    });
    el.appendChild(b);
  }
  document.body.appendChild(el);
  function close() {
    el.classList.remove("la-context--open");
  }
  const onDocClick = () => close();
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKey);
  const cleanups = [];
  return {
    attach(target) {
      const onCtx = (e) => {
        e.preventDefault();
        el.style.left = `${Math.min(e.clientX, innerWidth - 200)}px`;
        el.style.top = `${Math.min(e.clientY, innerHeight - el.offsetHeight - 12)}px`;
        el.classList.add("la-context--open");
        e.stopPropagation();
      };
      target.addEventListener("contextmenu", onCtx);
      cleanups.push(() => target.removeEventListener("contextmenu", onCtx));
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
      el.remove();
    }
  };
}
function animatedCursor() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) {
    return { destroy() {
    } };
  }
  const dot = document.createElement("div");
  dot.className = "la-cursor-dot";
  const ring = document.createElement("div");
  ring.className = "la-cursor-ring";
  document.body.append(dot, ring);
  let tx = -100, ty = -100, rx = -100, ry = -100;
  const onMove = (e) => {
    tx = e.clientX;
    ty = e.clientY;
  };
  document.addEventListener("mousemove", onMove);
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    rx += (tx - rx) * 0.16;
    ry += (ty - ry) * 0.16;
    dot.style.transform = `translate(${tx - 2}px, ${ty - 2}px)`;
    ring.style.transform = `translate(${rx - 13}px, ${ry - 13}px)`;
  };
  loop();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      dot.remove();
      ring.remove();
    }
  };
}
function skeleton(width, height) {
  const el = document.createElement("div");
  el.className = "la-skeleton";
  el.style.width = width;
  el.style.height = height;
  el.setAttribute("aria-hidden", "true");
  return el;
}
function noiseOverlay(parent, opacity = 0.05) {
  const el = document.createElement("canvas");
  el.className = "la-noise";
  el.style.opacity = String(opacity);
  const size = 128;
  el.width = size;
  el.height = size;
  const ctx = el.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 60;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.imageRendering = "pixelated";
  parent.appendChild(el);
  return el;
}
export {
  animatedCursor,
  contextMenu,
  noiseOverlay,
  skeleton,
  tooltip
};
