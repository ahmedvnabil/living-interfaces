/** Minimal typings for the vendored mp4-muxer build (v5). */
declare module 'mp4-muxer' {
  export class ArrayBufferTarget {
    buffer: ArrayBuffer;
  }
  export interface MuxerOptions {
    target: ArrayBufferTarget;
    video: {
      codec: 'avc' | 'hevc' | 'vp9' | 'av1';
      width: number;
      height: number;
      frameRate?: number;
    };
    fastStart: false | 'in-memory' | 'fragmented';
    firstTimestampBehavior?: 'strict' | 'offset' | 'cross-track-offset';
  }
  export class Muxer {
    constructor(options: MuxerOptions);
    target: ArrayBufferTarget;
    addVideoChunk(chunk: EncodedVideoChunk, meta?: EncodedVideoChunkMetadata): void;
    finalize(): void;
  }
}
