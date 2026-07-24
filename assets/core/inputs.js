class PlaceholderInput {
  status = "placeholder";
  cb = null;
  async connect() {
    this.status = "placeholder";
  }
  disconnect() {
    this.cb = null;
  }
  onData(cb) {
    this.cb = cb;
  }
  /** Host apps or future drivers push data here; assets receive it via setData(). */
  push(data) {
    this.cb?.(data);
  }
}
class HandTrackingInput extends PlaceholderInput {
  kind = "hand-tracking";
}
class MicrophoneInput extends PlaceholderInput {
  kind = "microphone";
}
class CameraTrackingInput extends PlaceholderInput {
  kind = "camera-tracking";
}
class MidiInput extends PlaceholderInput {
  kind = "midi";
}
class WebSocketInput extends PlaceholderInput {
  constructor(url = "") {
    super();
    this.url = url;
  }
  kind = "websocket";
}
class LiveDataInput extends PlaceholderInput {
  constructor(endpoint = "") {
    super();
    this.endpoint = endpoint;
  }
  kind = "live-data";
}
export {
  CameraTrackingInput,
  HandTrackingInput,
  LiveDataInput,
  MicrophoneInput,
  MidiInput,
  WebSocketInput
};
