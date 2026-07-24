/** External input sources. Real devices plug in behind this interface later;
 *  every source ships as a documented placeholder today. */

export type InputStatus = 'placeholder' | 'connecting' | 'connected' | 'error';

export interface InputSource<T = unknown> {
  readonly kind: string;
  readonly status: InputStatus;
  connect(): Promise<void>;
  disconnect(): void;
  onData(cb: (data: T) => void): void;
}

abstract class PlaceholderInput<T> implements InputSource<T> {
  abstract readonly kind: string;
  status: InputStatus = 'placeholder';
  protected cb: ((data: T) => void) | null = null;

  async connect(): Promise<void> {
    // Placeholder: integration point documented in /docs. No device access is made.
    this.status = 'placeholder';
  }
  disconnect(): void { this.cb = null; }
  onData(cb: (data: T) => void): void { this.cb = cb; }
  /** Host apps or future drivers push data here; assets receive it via setData(). */
  push(data: T): void { this.cb?.(data); }
}

export class HandTrackingInput extends PlaceholderInput<{ x: number; y: number; pinch: number }> {
  readonly kind = 'hand-tracking';
}
export class MicrophoneInput extends PlaceholderInput<{ level: number; spectrum: number[] }> {
  readonly kind = 'microphone';
}
export class CameraTrackingInput extends PlaceholderInput<{ motion: number; cx: number; cy: number }> {
  readonly kind = 'camera-tracking';
}
export class MidiInput extends PlaceholderInput<{ note: number; velocity: number; cc: Record<number, number> }> {
  readonly kind = 'midi';
}
export class WebSocketInput extends PlaceholderInput<unknown> {
  readonly kind = 'websocket';
  constructor(public url = '') { super(); }
}
export class LiveDataInput extends PlaceholderInput<unknown> {
  readonly kind = 'live-data';
  constructor(public endpoint = '') { super(); }
}
