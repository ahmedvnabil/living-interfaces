import * as THREE from "three";
import { AssetBase } from "./AssetBase.js";
class ThreeAsset extends AssetBase {
  renderer;
  scene;
  camera;
  createSurface() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(this.dpr());
    this.renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1e3);
  }
  destroySurface() {
    this.scene.traverse((obj) => {
      const mesh = obj;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
  onResize() {
    const r = this.container.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  exportCanvas() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement;
  }
}
export {
  ThreeAsset
};
