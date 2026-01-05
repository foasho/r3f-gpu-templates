import { useLayoutEffect } from 'react'
import { applyProps, type ThreeElements } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

type CourtProps = ThreeElements['primitive']

export function Court(props: CourtProps) {
  const { scene } = useGLTF('/court.glb')

  useLayoutEffect(() => {
    scene.traverse((o) => {
      // @ts-expect-error - isMesh is not typed
      if (o.isMesh) applyProps(o, { 'material-metalness': 0 })
    })
    const floor = scene.getObjectByName('GymFloor_ParquetShader_0')
    if (floor?.parent) floor.parent.remove(floor)
  }, [scene])

  return <primitive object={scene} {...props} />
}

// Preload the model
useGLTF.preload('/court.glb')

