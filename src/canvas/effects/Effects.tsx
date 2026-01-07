import { useLayoutEffect, useState } from 'react'
import * as THREE from 'three/webgpu'
import * as TSL from 'three/tsl'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'

// 分離されたエフェクトモジュール
import { useScenePass } from './useScenePass'
import { createSSRPass, useSSRControls } from './ssr'
import { createSSGIPass, useSSGIControls } from './ssgi'
import { createBloomPass } from './bloom'
import { createTRAAPass } from './traa'

export function Effects() {
  const { gl, scene, camera } = useThree()
  const [postProcessing] = useState(() => new THREE.PostProcessing(gl as unknown as THREE.WebGPURenderer))

  // グローバルエフェクト切り替え
  const { effects, bloomThreshold, bloomStrength, bloomRadius } = useControls({
    effects: true,
    bloomThreshold: { value: 0.15, min: 0, max: 1, step: 0.01 },
    bloomStrength: { value: 1.05, min: 0, max: 3, step: 0.01 },
    bloomRadius: { value: 0.85, min: 0, max: 1, step: 0.01 }
  })

  // 各エフェクトのコントロール
  const ssrConfig = useSSRControls()
  const ssgiConfig = useSSGIControls()

  // ScenePassとテクスチャを取得
  const { textures } = useScenePass(scene, camera)

  // ポストプロセッシングパイプラインを構築
  useLayoutEffect(() => {
    // 1. SSGI - Global Illumination & Ambient Occlusion
    const ssgiResult = createSSGIPass(textures, camera, ssgiConfig)

    // 2. Bloom
    const bloomPass = createBloomPass(ssgiResult.composited, {
      threshold: bloomThreshold,
      strength: bloomStrength,
      radius: bloomRadius
    })

    // 3. Bloom合成
    const withBloom = ssgiResult.composited.add(bloomPass)

    // 4. SSR - Screen Space Reflections
    const ssrPass = createSSRPass(textures, ssrConfig)

    // 5. SSRとの合成
    const composited = TSL.blendColor(withBloom, ssrPass)

    // 6. TRAA - Temporal Anti-Aliasing
    const finalPass = createTRAAPass(composited, textures, camera)

    // eslint-disable-next-line react-hooks/immutability
    postProcessing.outputNode = finalPass
    postProcessing.needsUpdate = true
  }, [textures, camera, ssrConfig, ssgiConfig, bloomThreshold, bloomStrength, bloomRadius, postProcessing])

  // レンダリング
  useFrame(() => effects && postProcessing.render(), effects ? 1 : 0)

  return null
}
