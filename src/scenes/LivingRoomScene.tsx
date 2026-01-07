import { useMemo, useRef, useLayoutEffect } from 'react'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LivingRoom } from '../canvas/objects/LivingRoom'
import { Effects } from '../canvas/effects'
import { useControls } from 'leva'

export function LivingRoomScene() {
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const { camera, gl } = useThree()
  const sunTarget = useMemo(() => new THREE.Object3D(), [])

  const {
    exposure,
    sunIntensity,
    sunWarmth,
    fillIntensity,
    sunX,
    sunY,
    sunZ,
    targetX,
    targetY,
    targetZ
  } = useControls({
    exposure: { value: 0.95, min: 0.5, max: 2.5, step: 0.01 },
    sunIntensity: { value: 10, min: 0, max: 50, step: 0.1 },
    sunWarmth: { value: 0.22, min: 0, max: 0.6, step: 0.01 },
    fillIntensity: { value: 0.25, min: 0, max: 2, step: 0.01 },
    sunX: { value: 7.5, min: -20, max: 20, step: 0.1 },
    sunY: { value: 8.0, min: 0, max: 20, step: 0.1 },
    sunZ: { value: 6.0, min: -20, max: 20, step: 0.1 },
    targetX: { value: 0.0, min: -5, max: 5, step: 0.1 },
    targetY: { value: 1.1, min: 0, max: 5, step: 0.1 },
    targetZ: { value: -0.5, min: -5, max: 5, step: 0.1 }
  })

  // カメラをリビング中央に配置
  useLayoutEffect(() => {
    camera.position.set(-0.3, 1.5, 2.5) // リビング中央後方
    camera.lookAt(0, 1.2, 0) // 部屋中央を見る
  }, [camera])

  // 露出（トーンマッピング）を調整
  useLayoutEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderer = gl as any
    // eslint-disable-next-line react-hooks/immutability
    renderer.toneMappingExposure = exposure
  }, [gl, exposure])

  // 太陽光の位置・向きを調整
  useLayoutEffect(() => {
    sunTarget.position.set(targetX, targetY, targetZ)
    if (sunRef.current) sunRef.current.position.set(sunX, sunY, sunZ)
  }, [sunTarget, sunX, sunY, sunZ, targetX, targetY, targetZ])

  // 柔らかい光のアニメーション（オプション）
  useFrame(({ clock }) => {
    if (sunRef.current) {
      const t = clock.getElapsedTime() * 0.06
      // 少しだけ“午後の太陽”みたいに動かす（不要なら0に）
      sunRef.current.position.x = Math.sin(t) * 0.35 + sunX
    }
  })

  return (
    <>
      {/* 柔らかいフォグ - 室内の空気感を演出 */}
      <fog attach="fog" args={['#e8dfd6', 6, 30]} />
      
      {/* 背景色 */}
      <color attach="background" args={['#f2efe9']} />

      {/* 太陽のターゲット（部屋中心あたり） */}
      <primitive object={sunTarget} position={[0, 1.1, 0]} />

      {/* メインライト（太陽光）- 右上から斜めに差し込む */}
      <directionalLight
        ref={sunRef}
        target={sunTarget}
        intensity={sunIntensity}
        // 暖色寄り（夕方の日差し）
        color={new THREE.Color().setHSL(0.09, 0.45, 0.78 + sunWarmth * 0.15)}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* フィルライト（環境の回り込み） */}
      <hemisphereLight intensity={fillIntensity} color="#dbe7ff" groundColor="#f6e7d6" />

      {/* アンビエントライト - 全体の明るさ調整 */}
      <ambientLight intensity={0.12} color="#ffffff" />

      {/* “窓枠っぽい影”を作るゴボ（見えないけど影だけ落とす） */}
      <WindowGobo />

      {/* 天井の間接照明（Bloomで気持ちよく） */}
      <CeilingStripLight />

      {/* リビングルームモデル */}
      <LivingRoom />

      {/* 床の影（モデルに床がない場合のフォールバック） */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={10}
      />

      {/* カメラコントロール */}
      <OrbitControls
        makeDefault
        minDistance={0.5}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        target={[0, 1.2, 0]}
        enableDamping
        dampingFactor={0.05}
      />

      {/* 環境マップ - 室内向けのHDRI */}
      <Environment
        // 夕方寄りの暖色環境にすると“日差し感”が出やすい
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_dusk_2_puresky_1k.hdr"
        background={false}
        environmentIntensity={0.9}
      />

      {/* ポストプロセッシングエフェクト */}
      <Effects />
    </>
  )
}

function WindowGobo() {
  // 右側の開口から日差しが入る想定（位置はLevaで sun / target を追い込むと一緒に効いてきます）
  return (
    <group position={[2.2, 1.9, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
      {/* フレーム */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 2.2, 0.06]} />
        <meshStandardMaterial colorWrite={false} />
      </mesh>
      {/* 縦桟 */}
      <mesh castShadow position={[-0.55, 0, 0]}>
        <boxGeometry args={[0.08, 2.2, 0.08]} />
        <meshStandardMaterial colorWrite={false} />
      </mesh>
      <mesh castShadow position={[0.55, 0, 0]}>
        <boxGeometry args={[0.08, 2.2, 0.08]} />
        <meshStandardMaterial colorWrite={false} />
      </mesh>
      {/* 横桟 */}
      <mesh castShadow position={[0, -0.35, 0]}>
        <boxGeometry args={[2.2, 0.08, 0.08]} />
        <meshStandardMaterial colorWrite={false} />
      </mesh>
    </group>
  )
}

function CeilingStripLight() {
  return (
    <group position={[0.2, 2.95, 0.2]} rotation={[0, 0.25, 0]}>
      {/* 発光ストリップ（見た目） */}
      <mesh>
        <boxGeometry args={[3.2, 0.03, 0.12]} />
        <meshStandardMaterial color="#111" emissive="#ffd2a6" emissiveIntensity={4} />
      </mesh>
      {/* 実ライト（室内の柔らかい回り込み） */}
      <spotLight
        position={[0, 0, 0]}
        angle={0.9}
        penumbra={1}
        intensity={18}
        distance={12}
        decay={2}
        color="#ffe7c9"
        castShadow={false}
      />
    </group>
  )
}
