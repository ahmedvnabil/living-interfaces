/** Procedural Clouds — pseudo-volumetric fBm strata in a fragment shader. */
import * as THREE from 'three';
import { ThreeAsset } from '../core/ThreeAsset.js';
import { getMeta } from '../core/catalog.js';
import { CLOUDS_VERT, CLOUDS_FRAG } from '../shaders/clouds.js';
import { hexToRgb } from '../utils/color.js';

export class ProceduralClouds extends ThreeAsset {
  private mat: THREE.ShaderMaterial | null = null;

  constructor() { super(getMeta('procedural-clouds')); }

  private col(hex: string): THREE.Vector3 {
    const { r, g, b } = hexToRgb(hex);
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  }

  protected setup(): void {
    this.scene.clear();
    this.mat = new THREE.ShaderMaterial({
      vertexShader: CLOUDS_VERT,
      fragmentShader: CLOUDS_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCoverage: { value: this.params.coverage },
        uSpeed: { value: this.params.speed },
        uDetail: { value: this.params.detail },
        uSeed: { value: (this.rng.seed % 1000) / 1000 },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uPointerOn: { value: 0 },
        uBg: { value: this.col(this.theme.bg) },
        uFg: { value: this.col(this.theme.fg) },
        uAccent: { value: this.col(this.theme.accent) },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.scene.add(quad);
  }

  setTheme(theme: Parameters<ThreeAsset['setTheme']>[0]): void {
    super.setTheme(theme);
    if (this.mat) {
      this.mat.uniforms.uBg.value = this.col(this.theme.bg);
      this.mat.uniforms.uFg.value = this.col(this.theme.fg);
      this.mat.uniforms.uAccent.value = this.col(this.theme.accent);
    }
  }

  protected frame(_dt: number): void {
    if (!this.mat) return;
    const u = this.mat.uniforms;
    u.uTime.value = this.time;
    u.uCoverage.value = this.params.coverage;
    u.uSpeed.value = this.params.speed;
    u.uDetail.value = Math.round(this.params.detail);
    u.uPointer.value.set(this.pointer.nx, 1 - this.pointer.ny);
    u.uPointerOn.value = this.pointer.active ? 1 : 0;
    u.uRes.value.set(Math.max(this.container.offsetWidth, 1), Math.max(this.container.offsetHeight, 1));
    this.renderer.render(this.scene, this.camera);
  }
}

export default ProceduralClouds;
