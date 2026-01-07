import { useLayoutEffect } from 'react'
import { applyProps, type ThreeElements } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

type LivingRoomProps = Omit<ThreeElements['primitive'], 'object'>

export function LivingRoom(props: LivingRoomProps) {
  const { scene } = useGLTF('/white_modern_living_room.glb')

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        
        // マテリアルの調整
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          
          // 床や反射面の調整
          if (mat.name?.toLowerCase().includes('floor') || 
              mat.name?.toLowerCase().includes('marble') ||
              mat.name?.toLowerCase().includes('tile')) {
            applyProps(mesh, {
              'material-roughness': 0.1,
              'material-metalness': 0.1,
            })
          }
          
          // ガラス素材の調整
          if (mat.name?.toLowerCase().includes('glass') ||
              mat.name?.toLowerCase().includes('window')) {
            applyProps(mesh, {
              'material-roughness': 0,
              'material-metalness': 0.9,
              'material-transparent': true,
              'material-opacity': 0.3,
            })
          }

          // 金属素材の調整
          if (mat.name?.toLowerCase().includes('metal') ||
              mat.name?.toLowerCase().includes('chrome')) {
            applyProps(mesh, {
              'material-roughness': 0.2,
              'material-metalness': 1,
            })
          }
        }
      }
    })
  }, [scene])

  return <primitive {...props} object={scene} />
}

// Preload the model
useGLTF.preload('/white_modern_living_room.glb')

