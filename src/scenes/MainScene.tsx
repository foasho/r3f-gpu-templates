import { OrbitControls, Environment } from '@react-three/drei'
import { Court, Floor } from '../canvas/objects'
import { Effects } from '../canvas/effects'

export function MainScene() {
  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={['purple', 0, 130]} />

      {/* Scene Objects */}
      <group position={[0, -1, 0]}>
        <Court />
        <Floor />
        <mesh castShadow position={[0, 0.6, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial />
        </mesh>
      </group>

      {/* Controls */}
      <OrbitControls 
        minPolarAngle={Math.PI / 2} 
        maxPolarAngle={Math.PI / 2} 
      />

      {/* Environment */}
      <Environment 
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_dusk_2_puresky_1k.hdr" 
        background 
      />

      {/* Post Processing Effects */}
      <Effects />
    </>
  )
}

