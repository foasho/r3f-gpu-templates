import type * as THREE from 'three'
import type * as TSL from 'three/tsl'
import { traa as traaNode } from 'three/examples/jsm/tsl/display/TRAANode.js'
import type { ScenePassTextures } from './types'

/**
 * TRAAパス（Temporal Reprojection Anti-Aliasing）を生成する
 */
export function createTRAAPass(
  colorInput: TSL.ShaderNodeObject<TSL.Node>,
  textures: ScenePassTextures,
  camera: THREE.Camera
) {
  return traaNode(
    colorInput,
    textures.depth,
    textures.velocity,
    camera
  )
}

