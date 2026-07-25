/** Frame-accurate MP4 export via WebCodecs: explicit per-frame timestamps,
 *  H.264 in an MP4 container, no ffmpeg and no realtime constraint. */
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type { AssetBase } from '../core/AssetBase.js';
import { downloadBlob } from '../core/AssetBase.js';

export function supportsWebCodecs(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

/** Highest-profile H.264 codec string the browser supports for this config. */
async function pickCodec(width: number, height: number, fps: number, bitrate: number): Promise<string | null> {
  const candidates = ['avc1.640033', 'avc1.640028', 'avc1.4d0032', 'avc1.42003e', 'avc1.42001f'];
  for (const codec of candidates) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec, width, height, framerate: fps, bitrate,
      });
      if (supported) return codec;
    } catch { /* try the next profile */ }
  }
  return null;
}

/** Step the simulation offline and encode every frame with an exact
 *  timestamp (i / fps). Output plays at precisely the requested duration
 *  on any machine, however slowly the scene renders. */
export async function renderMp4(
  asset: AssetBase,
  canvas: HTMLCanvasElement,
  seconds: number,
  fps: number,
  filename: string,
  applyFrame: (t: number) => void,
  onProgress: (frac: number) => void,
): Promise<void> {
  const width = canvas.width, height = canvas.height;
  if (width % 2 || height % 2) throw new Error('MP4 export needs even dimensions');
  const bitrate = Math.min(Math.round(width * height * fps * 0.15), 45_000_000);
  const codec = await pickCodec(width, height, fps, bitrate);
  if (!codec) throw new Error('No supported H.264 encoder configuration');

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height, frameRate: fps },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  });

  let encodeError: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { encodeError = e; },
  });
  encoder.configure({ codec, width, height, framerate: fps, bitrate });

  const frames = Math.round(seconds * fps);
  const dt = 1 / fps;
  const usPerFrame = 1_000_000 / fps;
  for (let i = 0; i <= frames; i++) {
    if (encodeError) break;
    applyFrame(i * dt);
    asset.renderFrame(dt);
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round(i * usPerFrame),
      duration: Math.round(usPerFrame),
    });
    encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    onProgress(i / frames);
    // keep the encoder queue bounded and the UI responsive
    while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    if (i % 8 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  await encoder.flush();
  encoder.close();
  if (encodeError) throw encodeError;
  muxer.finalize();
  downloadBlob(new Blob([muxer.target.buffer], { type: 'video/mp4' }), filename);
}
