import * as THREE from 'three/webgpu'
import { Canvas, extend } from "@react-three/fiber";
import type { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js';

export const R3FCanvas = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
    shadows
    gl={(props) => {
      extend({ WebGPURenderer: THREE.WebGPURenderer })
      const gpuProps = { ...props, antialias: false } as WebGPURendererParameters
      const renderer = new THREE.WebGPURenderer(gpuProps)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.shadowMap.enabled = true
      return renderer.init().then(() => renderer)
    }}
    dpr={[1, 1.5]}
    camera={{ near: 0.1, far: 40, fov: 75 }}>
      {children}
    </Canvas>
  )
}
