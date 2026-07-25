/** Canvas → WebM capture: realtime stream recording and frame-accurate
 *  offline rendering via CanvasCaptureMediaStreamTrack.requestFrame(). */
import type { AssetBase } from '../core/AssetBase.js';
import { downloadBlob } from '../core/AssetBase.js';

function mimeType(): string {
  for (const m of ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

function makeRecorder(stream: MediaStream, onDone: (blob: Blob) => void): MediaRecorder {
  const rec = new MediaRecorder(stream, { mimeType: mimeType(), videoBitsPerSecond: 24_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  rec.onstop = () => onDone(new Blob(chunks, { type: 'video/webm' }));
  return rec;
}

/** Record the live canvas for `seconds` in real time. Returns a stop function. */
export function recordRealtime(
  canvas: HTMLCanvasElement,
  seconds: number,
  filename: string,
  onProgress: (frac: number) => void,
  onDone: () => void,
): () => void {
  const stream = canvas.captureStream(60);
  const rec = makeRecorder(stream, (blob) => { downloadBlob(blob, filename); onDone(); });
  rec.start(250);
  const t0 = performance.now();
  const tick = setInterval(() => {
    const frac = (performance.now() - t0) / (seconds * 1000);
    onProgress(Math.min(frac, 1));
    if (frac >= 1) stop();
  }, 100);
  let stopped = false;
  function stop(): void {
    if (stopped) return;
    stopped = true;
    clearInterval(tick);
    rec.stop();
    stream.getTracks().forEach((t) => t.stop());
  }
  return stop;
}

/** Render `seconds` of simulation offline at exactly `fps`, one frame at a
 *  time — never drops frames regardless of scene cost. The asset must be
 *  paused; `applyFrame(t)` sets automated params before each step. */
export async function renderOffline(
  asset: AssetBase,
  canvas: HTMLCanvasElement,
  seconds: number,
  fps: number,
  filename: string,
  applyFrame: (t: number) => void,
  onProgress: (frac: number) => void,
): Promise<void> {
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
  const done = new Promise<Blob>((res) => {
    const rec = makeRecorder(stream, res);
    rec.start(250);
    void (async () => {
      const frames = Math.round(seconds * fps);
      const dt = 1 / fps;
      const budget = 1000 / fps;
      for (let i = 0; i <= frames; i++) {
        const frameStart = performance.now();
        applyFrame(i * dt);
        asset.renderFrame(dt);
        track.requestFrame();
        onProgress(i / frames);
        // Yield EVERY frame — captureStream snapshots on task boundaries, so
        // skipping the yield drops frames. Pace to the target fps when the
        // scene renders faster than realtime, so timestamps come out correct;
        // slower scenes keep every frame (retime in an editor if needed).
        const elapsed = performance.now() - frameStart;
        await new Promise((r) => setTimeout(r, Math.max(budget - elapsed, 0)));
      }
      await new Promise((r) => setTimeout(r, 200));
      rec.stop();
    })();
  });
  const blob = await done;
  stream.getTracks().forEach((t) => t.stop());
  downloadBlob(blob, filename);
}
