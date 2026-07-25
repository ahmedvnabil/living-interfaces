import { downloadBlob } from "../core/AssetBase.js";
function mimeType() {
  for (const m of ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}
function makeRecorder(stream, onDone) {
  const rec = new MediaRecorder(stream, { mimeType: mimeType(), videoBitsPerSecond: 24e6 });
  const chunks = [];
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  rec.onstop = () => onDone(new Blob(chunks, { type: "video/webm" }));
  return rec;
}
function recordRealtime(canvas, seconds, filename, onProgress, onDone) {
  const stream = canvas.captureStream(60);
  const rec = makeRecorder(stream, (blob) => {
    downloadBlob(blob, filename);
    onDone();
  });
  rec.start(250);
  const t0 = performance.now();
  const tick = setInterval(() => {
    const frac = (performance.now() - t0) / (seconds * 1e3);
    onProgress(Math.min(frac, 1));
    if (frac >= 1) stop();
  }, 100);
  let stopped = false;
  function stop() {
    if (stopped) return;
    stopped = true;
    clearInterval(tick);
    rec.stop();
    stream.getTracks().forEach((t) => t.stop());
  }
  return stop;
}
async function renderOffline(asset, canvas, seconds, fps, filename, applyFrame, onProgress) {
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const done = new Promise((res) => {
    const rec = makeRecorder(stream, res);
    rec.start(250);
    void (async () => {
      const frames = Math.round(seconds * fps);
      const dt = 1 / fps;
      for (let i = 0; i <= frames; i++) {
        applyFrame(i * dt);
        asset.renderFrame(dt);
        track.requestFrame();
        onProgress(i / frames);
        if (i % 4 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      await new Promise((r) => setTimeout(r, 200));
      rec.stop();
    })();
  });
  const blob = await done;
  stream.getTracks().forEach((t) => t.stop());
  downloadBlob(blob, filename);
}
export {
  recordRealtime,
  renderOffline
};
