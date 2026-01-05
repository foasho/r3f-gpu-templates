import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'
import type * as THREE from 'three'

type FloorProps = Omit<ThreeElements['mesh'], 'geometry'>

// GLTF types for court.glb
type GLTFResult = GLTF & {
  nodes: {
    GymFloor_ParquetShader_0: THREE.Mesh
  }
  materials: {
    ParquetShader: THREE.MeshStandardMaterial
  }
}

export function Floor(props: FloorProps) {
  const { nodes, materials } = useGLTF('/court.glb') as unknown as GLTFResult

  return (
    <mesh
      receiveShadow
      position={[-13.68, 0.03, 17.52]}
      scale={0.02}
      geometry={nodes.GymFloor_ParquetShader_0.geometry}
      dispose={null}
      {...props}
    >
      <meshStandardMaterial
        map={materials.ParquetShader.map}
        normalMap={materials.ParquetShader.normalMap}
        metalness={0.25}
        roughness={0}
        normalScale={[0.25, -0.25]}
        color="#aaa"
      />
    </mesh>
  )
}

