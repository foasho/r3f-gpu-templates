import type { Camera, Scene } from 'three'
import type { Node, TextureNode } from 'three/webgpu'

/** ScenePassから取得できるテクスチャノード */
export type ScenePassTextures = {
  color: TextureNode
  normal: TextureNode
  depth: TextureNode
  velocity: TextureNode
  metalRough: TextureNode
  /** サンプリング可能なノーマル */
  sampledNormal: Node
}

/** SSRパスの設定 */
export type SSRConfig = {
  maxDistance: number
  blurQuality?: number
  thickness?: number
  resolutionScale?: number
}

/** SSGIパスの設定 */
export type SSGIConfig = {
  steps: number
  radius: number
  giIntensity: number
  aoIntensity: number
  thickness: number
  sliceCount?: number
}

/** Bloomパスの設定 */
export type BloomConfig = {
  threshold: number
  strength: number
  radius: number
}

/** ポストプロセッシングに必要なThreeオブジェクト */
export type PostProcessingContext = {
  camera: Camera
  scene: Scene
}
