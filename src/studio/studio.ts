/** Living Assets Studio — compose, animate and export any module as video. */
import { CATALOG } from '../core/catalog.js';
import type { AssetBase } from '../core/AssetBase.js';
import type { ModuleMeta } from '../core/types.js';
import { paramSlider, button } from '../components/controls.js';
import { badge, setBadge, formatSeed } from '../components/panels.js';
import { randomSeed } from '../utils/prng.js';
import { Timeline } from './timeline.js';
import { recordRealtime, renderOffline } from './recorder.js';
import { renderMp4, supportsWebCodecs } from './webcodecs-export.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const RESOLUTIONS: Record<string, [number, number]> = {
  'HD · 1280×720': [1280, 720],
  'Full HD · 1920×1080': [1920, 1080],
  'QHD · 2560×1440': [2560, 1440],
  'Square · 1080×1080': [1080, 1080],
  'Reels · 1080×1920': [1080, 1920],
};

type AssetCtor = new () => AssetBase;

class Studio {
  asset: AssetBase | null = null;
  meta: ModuleMeta = CATALOG[0];
  timeline = new Timeline(10);
  seed = randomSeed();
  theme: 'dark' | 'light' = 'dark';
  playT = 0;
  playing = false;
  busy = false;
  fps = 60;
  stopFn: (() => void) | null = null;
  private raf = 0;
  private lastNow = 0;

  readonly stage = $('stage');
  readonly stageWrap = $('stageWrap');
  readonly statusEl = badge('IDLE', 'idle');

  async mount(): Promise<void> {
    // module picker
    const sel = $('moduleSel') as unknown as HTMLSelectElement;
    for (const m of CATALOG) {
      const o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => this.load(sel.value));
    // resolution picker
    const res = $('resSel') as unknown as HTMLSelectElement;
    for (const k of Object.keys(RESOLUTIONS)) {
      const o = document.createElement('option');
      o.value = k; o.textContent = k;
      res.appendChild(o);
    }
    res.value = 'Full HD · 1920×1080';
    res.addEventListener('change', () => this.applyResolution());
    // transport + params + timeline
    $('statusBox').appendChild(this.statusEl);
    this.wireTransport();
    window.addEventListener('resize', () => this.fitStage());
    await this.load(CATALOG[0].id);
  }

  private resolution(): [number, number] {
    return RESOLUTIONS[($('resSel') as unknown as HTMLSelectElement).value];
  }

  private applyResolution(): void {
    const [w, h] = this.resolution();
    this.stage.style.width = `${w}px`;
    this.stage.style.height = `${h}px`;
    this.fitStage();
    this.asset?.resize();
  }

  private fitStage(): void {
    const [w, h] = this.resolution();
    const avail = this.stageWrap.getBoundingClientRect();
    const s = Math.min((avail.width - 24) / w, (avail.height - 24) / h, 1);
    this.stage.style.transform = `scale(${s})`;
    this.stageWrap.style.setProperty('--stage-h', `${h * s + 24}px`);
  }

  async load(id: string): Promise<void> {
    if (this.busy) return;
    this.meta = CATALOG.find((m) => m.id === id) ?? CATALOG[0];
    this.asset?.destroy();
    this.timeline.clear();
    this.playT = 0;
    const mod = (await import(`../simulations/${this.meta.id}.js`)) as { default: AssetCtor };
    this.asset = new mod.default();
    this.applyResolution();
    this.asset.init(this.stage, { seed: this.seed, maxDpr: 1, autoPause: false, theme: this.theme });
    $('seedLabel').textContent = formatSeed(this.seed);
    $('modMeta').textContent = `${this.meta.subtitle} · ${this.meta.renderer}`;
    this.buildParamPanel();
    this.renderLanes();
    this.setStatus('LIVE', 'live');
  }

  private buildParamPanel(): void {
    const box = $('params');
    box.replaceChildren();
    if (!this.asset) return;
    for (const def of this.asset.paramDefs()) {
      const row = document.createElement('div');
      row.className = 'st-paramrow';
      const slider = paramSlider(def, (v) => this.asset?.setParam(def.key, v));
      const key = button('⏺', () => {
        this.timeline.addKeyframe(def.key, this.playT, this.asset?.params[def.key] ?? def.value);
        this.renderLanes();
      }, { title: `Keyframe ${def.label} at playhead` });
      key.classList.add('st-keybtn');
      row.append(slider, key);
      box.appendChild(row);
    }
  }

  private wireTransport(): void {
    const playBtn = $('playBtn');
    playBtn.addEventListener('click', () => {
      this.playing = !this.playing;
      playBtn.textContent = this.playing ? 'Stop preview' : 'Preview';
      if (this.playing) {
        this.playT = 0;
        this.asset?.reset();
        this.startClock();
      } else {
        this.stopClock();
      }
    });
    const head = $('playhead') as unknown as HTMLInputElement;
    head.addEventListener('input', () => {
      this.playT = parseFloat(head.value) * this.timeline.duration;
      this.applyAutomation(this.playT);
      $('timeLabel').textContent = `${this.playT.toFixed(2)}s`;
    });
    const dur = $('duration') as unknown as HTMLInputElement;
    dur.addEventListener('change', () => {
      this.timeline.duration = Math.max(parseFloat(dur.value) || 10, 1);
      this.renderLanes();
    });
    $('seedBtn').addEventListener('click', () => {
      this.seed = randomSeed();
      this.asset?.regenerate(this.seed);
      $('seedLabel').textContent = formatSeed(this.seed);
    });
    $('themeBtn').addEventListener('click', () => {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = this.theme;
      this.asset?.setTheme(this.theme);
      $('themeBtn').textContent = this.theme === 'dark' ? 'Light' : 'Dark';
    });
    $('pngBtn').addEventListener('click', () => this.asset?.exportPNG(`${this.meta.id}-frame.png`));
    $('jsonBtn').addEventListener('click', () => {
      const setup = {
        module: this.meta.id, seed: this.seed,
        params: this.asset?.params, timeline: this.timeline.toJSON(),
      };
      navigator.clipboard?.writeText(JSON.stringify(setup, null, 2));
      this.setStatus('JSON COPIED', 'live');
      setTimeout(() => this.setStatus('LIVE', 'live'), 1200);
    });
    $('recBtn').addEventListener('click', () => this.record());
    $('renderBtn').addEventListener('click', () => this.render());
  }

  private exportCanvasEl(): HTMLCanvasElement | null {
    return this.stage.querySelector('canvas');
  }

  // ---- preview clock: drives automation while the asset self-animates ----
  private startClock(): void {
    this.lastNow = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.lastNow) / 1000, 0.1);
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

  private stopClock(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private applyAutomation(t: number): void {
    if (!this.asset) return;
    const values = this.timeline.sample(t);
    for (const [k, v] of Object.entries(values)) this.asset.setParam(k, v);
  }

  private syncPlayhead(): void {
    ($('playhead') as unknown as HTMLInputElement).value = String(this.playT / this.timeline.duration);
    $('timeLabel').textContent = `${this.playT.toFixed(2)}s`;
  }

  // ---- export ----
  private record(): void {
    if (this.busy || !this.asset) return;
    if (this.stopFn) { this.stopFn(); return; }
    const canvas = this.exportCanvasEl();
    if (!canvas) return;
    try {
      this.busy = false;
      this.playing = true;
      $('playBtn').textContent = 'Stop preview';
      this.playT = 0;
      this.asset.reset();
      this.asset.resume();
      this.startClock();
      this.setStatus('REC 0%', 'error');
      $('recBtn').textContent = 'Stop recording';
      this.stopFn = recordRealtime(
        canvas, this.timeline.duration, `${this.meta.id}-${this.seed}.webm`,
        (f) => this.setStatus(`REC ${Math.round(f * 100)}%`, 'error'),
        () => {
          this.stopFn = null;
          $('recBtn').textContent = 'Record realtime';
          this.setStatus('LIVE', 'live');
        },
      );
    } catch {
      this.setStatus('CAPTURE UNSUPPORTED', 'error');
    }
  }

  private async render(): Promise<void> {
    if (this.busy || !this.asset) return;
    const canvas = this.exportCanvasEl();
    if (!canvas) return;
    this.busy = true;
    this.playing = false;
    this.stopClock();
    $('playBtn').textContent = 'Preview';
    try {
      this.asset.pause();
      this.asset.reset();
      this.setStatus('RENDER 0%', 'error');
      const progress = (f: number) => this.setStatus(`RENDER ${Math.round(f * 100)}%`, 'error');
      if (supportsWebCodecs()) {
        // WebCodecs path: exact per-frame timestamps, MP4 out, no retiming needed
        await renderMp4(
          this.asset, canvas, this.timeline.duration, this.fps,
          `${this.meta.id}-${this.seed}.mp4`,
          (t) => this.applyAutomation(t), progress,
        );
      } else {
        await renderOffline(
          this.asset, canvas, this.timeline.duration, this.fps,
          `${this.meta.id}-${this.seed}-offline.webm`,
          (t) => this.applyAutomation(t), progress,
        );
      }
      this.setStatus('DONE — SAVED', 'live');
    } catch (err) {
      console.error('[studio] offline render failed', err);
      this.setStatus(this.meta.renderer === 'worker' ? 'WORKER MODULE — USE REALTIME' : 'RENDER FAILED', 'error');
    } finally {
      this.asset.resume();
      this.busy = false;
      setTimeout(() => this.setStatus('LIVE', 'live'), 2500);
    }
  }

  private setStatus(text: string, state: 'live' | 'error' | 'idle'): void {
    setBadge(this.statusEl, text, state === 'idle' ? 'idle' : state);
  }

  // ---- timeline lanes ----
  renderLanes(): void {
    const box = $('lanes');
    box.replaceChildren();
    const names = this.timeline.laneNames();
    $('lanesEmpty').style.display = names.length ? 'none' : 'block';
    for (const name of names) {
      const row = document.createElement('div');
      row.className = 'st-lane';
      const label = document.createElement('span');
      label.className = 'la-label';
      label.textContent = name;
      const track = document.createElement('div');
      track.className = 'st-lane__track';
      track.addEventListener('click', (e) => {
        const r = track.getBoundingClientRect();
        const t = ((e.clientX - r.left) / r.width) * this.timeline.duration;
        this.timeline.addKeyframe(name, t, this.asset?.params[name] ?? 0);
        this.renderLanes();
      });
      this.timeline.lane(name).forEach((kf, i) => {
        const dot = document.createElement('button');
        dot.className = 'st-lane__kf';
        dot.style.left = `${(kf.t / this.timeline.duration) * 100}%`;
        dot.title = `${name} = ${kf.v.toFixed(2)} @ ${kf.t.toFixed(2)}s — click to delete`;
        dot.addEventListener('click', (e) => {
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
