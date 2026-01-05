import type * as TSL from 'three/tsl'
import { bloom as bloomNode } from 'three/examples/jsm/tsl/display/BloomNode.js'
import type { BloomConfig } from './types'

/**
 * Bloomパスを生成する
 */
export function createBloomPass(
  colorInput: TSL.ShaderNodeObject<TSL.Node>,
  config?: Partial<BloomConfig>
) {
  return bloomNode(
    colorInput,
    config?.threshold ?? 0.1,
    config?.strength ?? 0.8,
    config?.radius ?? 0.9
  )
}

