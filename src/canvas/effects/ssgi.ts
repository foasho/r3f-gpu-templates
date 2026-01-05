import * as TSL from 'three/tsl'
import { ssgi as ssgiNode } from 'three/examples/jsm/tsl/display/SSGINode.js'
import { useControls, folder } from 'leva'
import type * as THREE from 'three'
import type { ScenePassTextures, SSGIConfig } from './types'

export interface SSGIResult {
  /** SSGI適用後のカラー（GI + AO合成済み） */
  composited: TSL.ShaderNodeObject<TSL.Node>
  /** GI成分のみ */
  gi: TSL.ShaderNodeObject<TSL.Node>
  /** AO成分のみ */
  ao: TSL.ShaderNodeObject<TSL.Node>
}

/**
 * SSGIパスを生成し、GI/AOを合成したカラーを返す
 */
export function createSSGIPass(
  textures: ScenePassTextures,
  camera: THREE.Camera,
  config: SSGIConfig
): SSGIResult {
  const ssgiPass = ssgiNode(
    textures.color,
    textures.depth,
    textures.sampledNormal,
    camera
  )

  ssgiPass.sliceCount.value = config.sliceCount ?? 2
  ssgiPass.stepCount.value = config.steps
  ssgiPass.radius.value = config.radius
  ssgiPass.giIntensity.value = config.giIntensity
  ssgiPass.aoIntensity.value = config.aoIntensity
  ssgiPass.thickness.value = config.thickness

  // Extract GI and AO from SSGI
  const gi = ssgiPass.rgb
  const ao = ssgiPass.a

  // Composite: sceneColor * AO + sceneColor * GI
  const composited = TSL.vec4(
    TSL.add(textures.color.rgb.mul(ao), textures.color.rgb.mul(gi)),
    textures.color.a
  )

  return { composited, gi, ao }
}

/**
 * SSGI用のLevaコントロールを提供するフック
 */
export function useSSGIControls(defaultValues?: Partial<SSGIConfig>) {
  const controls = useControls({
    ssgi: folder({
      steps: { 
        value: defaultValues?.steps ?? 8, 
        min: 0, 
        max: 32, 
        step: 1 
      },
      giIntensity: { 
        value: defaultValues?.giIntensity ?? 20, 
        min: 0, 
        max: 100 
      },
      aoIntensity: { 
        value: defaultValues?.aoIntensity ?? 4, 
        min: 0, 
        max: 4 
      },
      radius: { 
        value: defaultValues?.radius ?? 15, 
        min: 1, 
        max: 100 
      },
      thickness: { 
        value: defaultValues?.thickness ?? 10, 
        min: 0.01, 
        max: 10 
      }
    })
  })

  return {
    steps: controls.steps,
    giIntensity: controls.giIntensity,
    aoIntensity: controls.aoIntensity,
    radius: controls.radius,
    thickness: controls.thickness
  } as SSGIConfig
}

