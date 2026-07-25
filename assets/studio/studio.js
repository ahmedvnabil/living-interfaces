import { CATALOG } from "../core/catalog.js";
import { paramSlider, button } from "../components/controls.js";
import { badge, setBadge, formatSeed } from "../components/panels.js";
import { randomSeed } from "../utils/prng.js";
import { Timeline } from "./timeline.js";
import { recordRealtime, renderOffline } from "./recorder.js";
const $ = (id) => document.getElementById(id);
const RESOLUTIONS = {
  "HD \xB7 1280\xD7720": [1280, 720],
  "Full HD \xB7 1920\xD71080": [1920, 1080],
  "QHD \xB7 2560\xD71440": [2560, 1440],
  "Square \xB7 1080\xD71080": [1080, 1080],
  "Reels \xB7 1080\xD71920": [1080, 1920]
};
class Studio {
  asset = null;
  meta = CATALOG[0];
  timeline = new Timeline(10);
  seed = randomSeed();
  theme = "dark";
  playT = 0;
  playing = false;
  busy = false;
  fps = 60;
  stopFn = null;
  raf = 0;
  lastNow = 0;
  stage = $("stage");
  stageWrap = $("stageWrap");
  statusEl = badge("IDLE", "idle");
  async mount() {
    const sel = $("moduleSel");
    for (const m of CATALOG) {
      const o = document.createElement("option");
      o.value = m.id;
      o.textContent = m.name;
      sel.appendChild(o);
    }
    sel.addEventListener("change", () => this.load(sel.value));
    const res = $("resSel");
    for (const k of Object.keys(RESOLUTIONS)) {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = k;
      res.appendChild(o);
    }
    res.value = "Full HD \xB7 1920\xD71080";
    res.addEventListener("change", () => this.applyResolution());
    $("statusBox").appendChild(this.statusEl);
    this.wireTransport();
    window.addEventListener("resize", () => this.fitStage());
    await this.load(CATALOG[0].id);
  }
  resolution() {
    return RESOLUTIONS[$("resSel").value];
  }
  applyResolution() {
    const [w, h] = this.resolution();
    this.stage.style.width = `${w}px`;
    this.stage.style.height = `${h}px`;
    this.fitStage();
    this.asset?.resize();
  }
  fitStage() {
    const [w, h] = this.resolution();
    const avail = this.stageWrap.getBoundingClientRect();
    const s = Math.min((avail.width - 24) / w, (avail.height - 24) / h, 1);
    this.stage.style.transform = `scale(${s})`;
    this.stageWrap.style.setProperty("--stage-h", `${h * s + 24}px`);
  }
  async load(id) {
    if (this.busy) return;
    this.meta = CATALOG.find((m) => m.id === id) ?? CATALOG[0];
    this.asset?.destroy();
    this.timeline.clear();
    this.playT = 0;
    const mod = await import(`../simulations/${this.meta.id}.js`);
    this.asset = new mod.default();
    this.applyResolution();
    this.asset.init(this.stage, { seed: this.seed, maxDpr: 1, autoPause: false, theme: this.theme });
    $("seedLabel").textContent = formatSeed(this.seed);
    $("modMeta").textContent = `${this.meta.subtitle} \xB7 ${this.meta.renderer}`;
    this.buildParamPanel();
    this.renderLanes();
    this.setStatus("LIVE", "live");
  }
  buildParamPanel() {
    const box = $("params");
    box.replaceChildren();
    if (!this.asset) return;
    for (const def of this.asset.paramDefs()) {
      const row = document.createElement("div");
      row.className = "st-paramrow";
      const slider = paramSlider(def, (v) => this.asset?.setParam(def.key, v));
      const key = button("\u23FA", () => {
        this.timeline.addKeyframe(def.key, this.playT, this.asset?.params[def.key] ?? def.value);
        this.renderLanes();
      }, { title: `Keyframe ${def.label} at playhead` });
      key.classList.add("st-keybtn");
      row.append(slider, key);
      box.appendChild(row);
    }
  }
  wireTransport() {
    const playBtn = $("playBtn");
    playBtn.addEventListener("click", () => {
      this.playing = !this.playing;
      playBtn.textContent = this.playing ? "Stop preview" : "Preview";
      if (this.playing) {
        this.playT = 0;
        this.asset?.reset();
        this.startClock();
      } else {
        this.stopClock();
      }
    });
    const head = $("playhead");
    head.addEventListener("input", () => {
      this.playT = parseFloat(head.value) * this.timeline.duration;
      this.applyAutomation(this.playT);
      $("timeLabel").textContent = `${this.playT.toFixed(2)}s`;
    });
    const dur = $("duration");
    dur.addEventListener("change", () => {
      this.timeline.duration = Math.max(parseFloat(dur.value) || 10, 1);
      this.renderLanes();
    });
    $("seedBtn").addEventListener("click", () => {
      this.seed = randomSeed();
      this.asset?.regenerate(this.seed);
      $("seedLabel").textContent = formatSeed(this.seed);
    });
    $("themeBtn").addEventListener("click", () => {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = this.theme;
      this.asset?.setTheme(this.theme);
      $("themeBtn").textContent = this.theme === "dark" ? "Light" : "Dark";
    });
    $("pngBtn").addEventListener("click", () => this.asset?.exportPNG(`${this.meta.id}-frame.png`));
    $("jsonBtn").addEventListener("click", () => {
      const setup = {
        module: this.meta.id,
        seed: this.seed,
        params: this.asset?.params,
        timeline: this.timeline.toJSON()
      };
      navigator.clipboard?.writeText(JSON.stringify(setup, null, 2));
      this.setStatus("JSON COPIED", "live");
      setTimeout(() => this.setStatus("LIVE", "live"), 1200);
    });
    $("recBtn").addEventListener("click", () => this.record());
    $("renderBtn").addEventListener("click", () => this.render());
  }
  exportCanvasEl() {
    return this.stage.querySelector("canvas");
  }
  // ---- preview clock: drives automation while the asset self-animates ----
  startClock() {
    this.lastNow = performance.now();
    const loop = (now) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.lastNow) / 1e3, 0.1);
      this.lastNow = now;
      if (this.playing) {
        this.playT += dt;
        if (this.playT > this.timeline.duration) this.playT = 0;
        this.applyAutomation(this.playT);
        this.syncPlayhead();
      }
    };
    this.raf = requestAnimationFrame(loop);
  }
  stopClock() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
  applyAutomation(t) {
    if (!this.asset) return;
    const values = this.timeline.sample(t);
    for (const [k, v] of Object.entries(values)) this.asset.setParam(k, v);
  }
  syncPlayhead() {
    $("playhead").value = String(this.playT / this.timeline.duration);
    $("timeLabel").textContent = `${this.playT.toFixed(2)}s`;
  }
  // ---- export ----
  record() {
    if (this.busy || !this.asset) return;
    if (this.stopFn) {
      this.stopFn();
      return;
    }
    const canvas = this.exportCanvasEl();
    if (!canvas) return;
    try {
      this.busy = false;
      this.playing = true;
      $("playBtn").textContent = "Stop preview";
      this.playT = 0;
      this.asset.reset();
      this.asset.resume();
      this.startClock();
      this.setStatus("REC 0%", "error");
      $("recBtn").textContent = "Stop recording";
      this.stopFn = recordRealtime(
        canvas,
        this.timeline.duration,
        `${this.meta.id}-${this.seed}.webm`,
        (f) => this.setStatus(`REC ${Math.round(f * 100)}%`, "error"),
        () => {
          this.stopFn = null;
          $("recBtn").textContent = "Record realtime";
          this.setStatus("LIVE", "live");
        }
      );
    } catch {
      this.setStatus("CAPTURE UNSUPPORTED", "error");
    }
  }
  async render() {
    if (this.busy || !this.asset) return;
    const canvas = this.exportCanvasEl();
    if (!canvas) return;
    this.busy = true;
    this.playing = false;
    this.stopClock();
    $("playBtn").textContent = "Preview";
    try {
      this.asset.pause();
      this.asset.reset();
      this.setStatus("RENDER 0%", "error");
      await renderOffline(
        this.asset,
        canvas,
        this.timeline.duration,
        this.fps,
        `${this.meta.id}-${this.seed}-offline.webm`,
        (t) => this.applyAutomation(t),
        (f) => this.setStatus(`RENDER ${Math.round(f * 100)}%`, "error")
      );
      this.setStatus("DONE \u2014 SAVED", "live");
    } catch (err) {
      console.error("[studio] offline render failed", err);
      this.setStatus(this.meta.renderer === "worker" ? "WORKER MODULE \u2014 USE REALTIME" : "RENDER FAILED", "error");
    } finally {
      this.asset.resume();
      this.busy = false;
      setTimeout(() => this.setStatus("LIVE", "live"), 2500);
    }
  }
  setStatus(text, state) {
    setBadge(this.statusEl, text, state === "idle" ? "idle" : state);
  }
  // ---- timeline lanes ----
  renderLanes() {
    const box = $("lanes");
    box.replaceChildren();
    const names = this.timeline.laneNames();
    $("lanesEmpty").style.display = names.length ? "none" : "block";
    for (const name of names) {
      const row = document.createElement("div");
      row.className = "st-lane";
      const label = document.createElement("span");
      label.className = "la-label";
      label.textContent = name;
      const track = document.createElement("div");
      track.className = "st-lane__track";
      track.addEventListener("click", (e) => {
        const r = track.getBoundingClientRect();
        const t = (e.clientX - r.left) / r.width * this.timeline.duration;
        this.timeline.addKeyframe(name, t, this.asset?.params[name] ?? 0);
        this.renderLanes();
      });
      this.timeline.lane(name).forEach((kf, i) => {
        const dot = document.createElement("button");
        dot.className = "st-lane__kf";
        dot.style.left = `${kf.t / this.timeline.duration * 100}%`;
        dot.title = `${name} = ${kf.v.toFixed(2)} @ ${kf.t.toFixed(2)}s \u2014 click to delete`;
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          this.timeline.removeKeyframe(name, i);
          this.renderLanes();
        });
        track.appendChild(dot);
      });
      row.append(label, track);
      box.appendChild(row);
    }
  }
}
new Studio().mount();
