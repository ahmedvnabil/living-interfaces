/** Base for Three.js WebGL assets: renderer/scene/camera lifecycle + disposal. */
import * as THREE from 'three';
import { AssetBase } from './AssetBase.js';

export abstract class ThreeAsset extends AssetBase {
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;

  protected createSurface(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(this.dpr());
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  }

  protected destroySurface(): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  protected onResize(): void {
    const w = Math.max(1, this.container.offsetWidth);
    const h = Math.max(1, this.container.offsetHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  exportCanvas(): HTMLCanvasElement | null {
    // Render once right before capture so the buffer is fresh.
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement;
  }
}
