import { useMemo } from 'react'
import * as THREE from 'three/webgpu'
import * as TSL from 'three/tsl'
import type { Node } from 'three/webgpu'
import type { ScenePassTextures } from './types'

/**
 * ScenePassとMRTテクスチャを生成するフック
 */
export const useScenePass = (scene: THREE.Scene, camera: THREE.Camera) => {
  return useMemo(() => {
    const scenePass = TSL.pass(scene, camera, { 
      minFilter: THREE.NearestFilter, 
      magFilter: THREE.NearestFilter 
    })

    scenePass.setMRT(
      TSL.mrt({
        output: TSL.output,
        normal: TSL.directionToColor(TSL.normalView),
        metalrough: TSL.vec2(TSL.metalness, TSL.roughness),
        velocity: TSL.velocity
      })
    )

    const textures: ScenePassTextures = {
      color: scenePass.getTextureNode('output'),
      normal: scenePass.getTextureNode('normal'),
      depth: scenePass.getTextureNode('depth'),
      velocity: scenePass.getTextureNode('velocity'),
      metalRough: scenePass.getTextureNode('metalrough'),
      sampledNormal: TSL.sample((uv: Node) => 
        TSL.colorToDirection(scenePass.getTextureNode('normal').sample(uv))
      )
    }

    return { scenePass, textures }
  }, [scene, camera])
}
