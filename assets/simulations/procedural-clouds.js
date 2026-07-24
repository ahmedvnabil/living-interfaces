import * as THREE from "three";
import { ThreeAsset } from "../core/ThreeAsset.js";
import { getMeta } from "../core/catalog.js";
import { CLOUDS_VERT, CLOUDS_FRAG } from "../shaders/clouds.js";
import { hexToRgb } from "../utils/color.js";
class ProceduralClouds extends ThreeAsset {
  mat = null;
  constructor() {
    super(getMeta("procedural-clouds"));
  }
  col(hex) {
    const { r, g, b } = hexToRgb(hex);
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  }
  setup() {
    this.scene.clear();
    this.mat = new THREE.ShaderMaterial({
      vertexShader: CLOUDS_VERT,
      fragmentShader: CLOUDS_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCoverage: { value: this.params.coverage },
        uSpeed: { value: this.params.speed },
        uDetail: { value: this.params.detail },
        uSeed: { value: this.rng.seed % 1e3 / 1e3 },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uPointerOn: { value: 0 },
        uBg: { value: this.col(this.theme.bg) },
        uFg: { value: this.col(this.theme.fg) },
        uAccent: { value: this.col(this.theme.accent) },
        uRes: { value: new THREE.Vector2(1, 1) }
      }
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.scene.add(quad);
  }
  setTheme(theme) {
    super.setTheme(theme);
    if (this.mat) {
      this.mat.uniforms.uBg.value = this.col(this.theme.bg);
      this.mat.uniforms.uFg.value = this.col(this.theme.fg);
      this.mat.uniforms.uAccent.value = this.col(this.theme.accent);
    }
  }
  frame(_dt) {
    if (!this.mat) return;
    const u = this.mat.uniforms;
    u.uTime.value = this.time;
    u.uCoverage.value = this.params.coverage;
    u.uSpeed.value = this.params.speed;
    u.uDetail.value = Math.round(this.params.detail);
    u.uPointer.value.set(this.pointer.nx, 1 - this.pointer.ny);
    u.uPointerOn.value = this.pointer.active ? 1 : 0;
    const r = this.container.getBoundingClientRect();
    u.uRes.value.set(Math.max(r.width, 1), Math.max(r.height, 1));
    this.renderer.render(this.scene, this.camera);
  }
}
var procedural_clouds_default = ProceduralClouds;
export {
  ProceduralClouds,
  procedural_clouds_default as default
};
