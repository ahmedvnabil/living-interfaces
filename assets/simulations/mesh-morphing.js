import * as THREE from "three";
import { ThreeAsset } from "../core/ThreeAsset.js";
import { getMeta } from "../core/catalog.js";
import { Noise } from "../utils/noise.js";
class MeshMorphing extends ThreeAsset {
  wire = null;
  points = null;
  base;
  noise;
  geo;
  constructor() {
    super(getMeta("mesh-morphing"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.scene.clear();
    this.scene.background = new THREE.Color(this.theme.bg);
    const ico = new THREE.IcosahedronGeometry(1.35, 24);
    this.base = new Float32Array(ico.attributes.position.array);
    this.geo = ico;
    this.wire = new THREE.Mesh(
      ico,
      new THREE.MeshBasicMaterial({ color: new THREE.Color(this.theme.fg), wireframe: true, transparent: true, opacity: 0.08 })
    );
    this.points = new THREE.Points(
      ico,
      new THREE.PointsMaterial({ color: new THREE.Color(this.theme.accent), size: 0.012, transparent: true, opacity: 0.75 })
    );
    this.scene.add(this.wire, this.points);
    this.camera.position.set(0, 0, 4);
  }
  setTheme(theme) {
    super.setTheme(theme);
    if (this.initialized) {
      this.scene.background = new THREE.Color(this.theme.bg);
      if (this.wire) this.wire.material.color.set(this.theme.fg);
      if (this.points) this.points.material.color.set(this.theme.accent);
    }
  }
  frame(_dt) {
    const { amp, freq, speed } = this.params;
    const t = this.time * speed;
    const pos = this.geo.attributes.position;
    const arr = pos.array;
    const ptrAmp = this.pointer.active ? 0.3 * Math.hypot(this.pointer.nx - 0.5, this.pointer.ny - 0.5) : 0;
    for (let i = 0; i < pos.count; i++) {
      const bx = this.base[i * 3], by = this.base[i * 3 + 1], bz = this.base[i * 3 + 2];
      const n = this.noise.fbm3(bx * freq + t * 0.4, by * freq, bz * freq + t * 0.25, 3);
      const s = 1 + n * (amp + ptrAmp);
      arr[i * 3] = bx * s;
      arr[i * 3 + 1] = by * s;
      arr[i * 3 + 2] = bz * s;
    }
    pos.needsUpdate = true;
    const az = this.time * 0.2 + (this.pointer.active ? (this.pointer.nx - 0.5) * 2 : 0);
    this.camera.position.set(Math.cos(az) * 4, (this.pointer.active ? (0.5 - this.pointer.ny) * 2 : Math.sin(this.time * 0.11)) * 1.2, Math.sin(az) * 4);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
}
var mesh_morphing_default = MeshMorphing;
export {
  MeshMorphing,
  mesh_morphing_default as default
};
