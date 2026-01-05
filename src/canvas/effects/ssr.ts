import { ssr as ssrNode } from 'three/examples/jsm/tsl/display/SSRNode.js'
import { useControls, folder } from 'leva'
import type { ScenePassTextures, SSRConfig } from './types'

/**
 * SSRパスを生成する
 */
export function createSSRPass(
  textures: ScenePassTextures,
  config: SSRConfig
) {
  const ssrPass = ssrNode(
    textures.color,
    textures.depth,
    textures.sampledNormal,
    textures.metalRough.r,
    textures.metalRough.g
  )

  ssrPass.maxDistance.value = config.maxDistance
  ssrPass.blurQuality.value = config.blurQuality ?? 1
  ssrPass.thickness.value = config.thickness ?? 0.15
  ssrPass.resolutionScale = config.resolutionScale ?? 1

  return ssrPass
}

/**
 * SSR用のLevaコントロールを提供するフック
 */
export function useSSRControls(defaultValues?: Partial<SSRConfig>) {
  const controls = useControls({
    ssr: folder({
      distance: { 
        value: defaultValues?.maxDistance ?? 11, 
        min: 0, 
        max: 100, 
        step: 1 
      }
    })
  })

  return {
    maxDistance: controls.distance
  } as SSRConfig
}

