import * as THREE from "three";
import { ThreeAsset } from "../core/ThreeAsset.js";
import { getMeta } from "../core/catalog.js";
import { Noise } from "../utils/noise.js";
const SEG = 96;
class TerrainGenerator extends ThreeAsset {
  mesh = null;
  noise;
  constructor() {
    super(getMeta("terrain-generator"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.scene.clear();
    this.scene.background = new THREE.Color(this.theme.bg);
    this.buildMesh();
    this.camera.position.set(0, 2.6, 4.2);
    this.camera.lookAt(0, 0, 0);
  }
  heightAt(x, z) {
    const { relief, scale, detail } = this.params;
    return this.noise.fbm2(x * 0.35 * scale, z * 0.35 * scale, Math.round(detail)) * relief;
  }
  buildMesh() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    const plane = new THREE.PlaneGeometry(6, 6, SEG, SEG);
    plane.rotateX(-Math.PI / 2);
    const pos = plane.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, this.heightAt(pos.getX(i), pos.getZ(i)));
    }
    pos.needsUpdate = true;
    const wire = new THREE.WireframeGeometry(plane);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.theme.fg),
      transparent: true,
      opacity: 0.22
    });
    this.mesh = new THREE.LineSegments(wire, mat);
    this.scene.add(this.mesh);
    plane.dispose();
  }
  onParamChange() {
    this.buildMesh();
  }
  setTheme(theme) {
    super.setTheme(theme);
    if (this.initialized) {
      this.scene.background = new THREE.Color(this.theme.bg);
      if (this.mesh) this.mesh.material.color.set(this.theme.fg);
    }
  }
  frame(_dt) {
    if (!this.mesh) return;
    const az = this.time * 0.12 + (this.pointer.active ? (this.pointer.nx - 0.5) * 1.6 : 0);
    const el = 2.2 + (this.pointer.active ? (this.pointer.ny - 0.5) * 1.6 : 0.4);
    this.camera.position.set(Math.cos(az) * 4.6, el, Math.sin(az) * 4.6);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
}
var terrain_generator_default = TerrainGenerator;
export {
  TerrainGenerator,
  terrain_generator_default as default
};
