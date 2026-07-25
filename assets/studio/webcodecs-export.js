import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { downloadBlob } from "../core/AssetBase.js";
function supportsWebCodecs() {
  return typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined";
}
async function pickCodec(width, height, fps, bitrate) {
  const candidates = ["avc1.640033", "avc1.640028", "avc1.4d0032", "avc1.42003e", "avc1.42001f"];
  for (const codec of candidates) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec,
        width,
        height,
        framerate: fps,
        bitrate
      });
      if (supported) return codec;
    } catch {
    }
  }
  return null;
}
async function renderMp4(asset, canvas, seconds, fps, filename, applyFrame, onProgress) {
  const width = canvas.width, height = canvas.height;
  if (width % 2 || height % 2) throw new Error("MP4 export needs even dimensions");
  const bitrate = Math.min(Math.round(width * height * fps * 0.15), 45e6);
  const codec = await pickCodec(width, height, fps, bitrate);
  if (!codec) throw new Error("No supported H.264 encoder configuration");
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height, frameRate: fps },
    fastStart: "in-memory",
    firstTimestampBehavior: "offset"
  });
  let encodeError = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      encodeError = e;
    }
  });
  encoder.configure({ codec, width, height, framerate: fps, bitrate });
  const frames = Math.round(seconds * fps);
  const dt = 1 / fps;
  const usPerFrame = 1e6 / fps;
  for (let i = 0; i <= frames; i++) {
    if (encodeError) break;
    applyFrame(i * dt);
    asset.renderFrame(dt);
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round(i * usPerFrame),
      duration: Math.round(usPerFrame)
    });
    encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    onProgress(i / frames);
    while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    if (i % 8 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  await encoder.flush();
  encoder.close();
  if (encodeError) throw encodeError;
  muxer.finalize();
  downloadBlob(new Blob([muxer.target.buffer], { type: "video/mp4" }), filename);
}
export {
  renderMp4,
  supportsWebCodecs
};
