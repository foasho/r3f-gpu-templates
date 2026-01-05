# R3F WebGPU テンプレート アーキテクチャ

このドキュメントでは、React Three Fiber (R3F) + WebGPU + TSL（Three.js Shading Language）を使用したポストプロセッシングテンプレートの構造を説明します。

---

## 📁 フォルダ構成

```mermaid
flowchart TB
    subgraph src["src/"]
        App["App.tsx"]
        
        subgraph canvas["canvas/"]
            canvasTsx["canvas.tsx<br/>WebGPU Canvas設定"]
            objects["objects/<br/>3Dオブジェクト"]
            effects["effects/<br/>ポストプロセッシング"]
        end
        
        scenes["scenes/<br/>シーン構成"]
        providers["providers/<br/>Reactプロバイダー"]
    end
```

| フォルダ | 役割 |
|---------|------|
| `canvas/` | R3F Canvas と 3D関連のコード |
| `canvas/objects/` | GLTFモデル、メッシュなどの3Dオブジェクト |
| `canvas/effects/` | ポストプロセッシングエフェクト（SSR, SSGI, Bloom等） |
| `scenes/` | シーン全体の構成（オブジェクト + エフェクト + 環境） |
| `providers/` | React Context プロバイダー |

---

## 🔄 アプリケーションフロー

```mermaid
flowchart TD
    subgraph App["App.tsx"]
        R3FCanvas["R3FCanvas<br/>(WebGPU)"]
        Suspense["Suspense"]
        MainScene["MainScene"]
    end

    subgraph Scene["scenes/"]
        Objects["3D Objects"]
        Environment["Environment"]
        Controls["Controls"]
        Effects["Effects"]
    end

    R3FCanvas --> Suspense --> MainScene
    MainScene --> Objects
    MainScene --> Environment
    MainScene --> Controls
    MainScene --> Effects
```

---

## 🎨 WebGPU レンダラー設定

`canvas/` フォルダで WebGPU レンダラーを初期化します。

```mermaid
flowchart LR
    subgraph Canvas["R3FCanvas"]
        GL["gl prop<br/>(カスタムレンダラー)"]
        WebGPU["THREE.WebGPURenderer"]
        Init["renderer.init()"]
    end

    GL --> WebGPU --> Init
    Init -->|Promise| Return["レンダラーを返す"]
```

**ポイント:**
- `three/webgpu` からインポート
- `antialias: false` → TRAAで後からアンチエイリアス適用
- `renderer.init()` は非同期（Promise）

---

## 🖼️ ポストプロセッシング パイプライン

### 全体フロー

```mermaid
flowchart TB
    subgraph Input["入力"]
        Scene["シーン"]
        Camera["カメラ"]
    end

    subgraph ScenePass["ScenePass (MRT)"]
        MRT["Multiple Render Targets"]
        Color["color<br/>(出力カラー)"]
        Normal["normal<br/>(法線)"]
        Depth["depth<br/>(深度)"]
        Velocity["velocity<br/>(モーション)"]
        MetalRough["metalrough<br/>(金属度/粗さ)"]
    end

    subgraph Effects["エフェクトチェーン"]
        SSGI["SSGI<br/>(GI + AO)"]
        Bloom["Bloom"]
        SSR["SSR<br/>(反射)"]
        TRAA["TRAA<br/>(AA)"]
    end

    subgraph Output["出力"]
        Final["最終画像"]
    end

    Scene --> MRT
    Camera --> MRT
    MRT --> Color & Normal & Depth & Velocity & MetalRough

    Color --> SSGI
    Depth --> SSGI
    Normal --> SSGI

    SSGI -->|"composited"| Bloom
    Bloom -->|"withBloom"| BlendSSR["blendColor"]
    
    Color --> SSR
    Depth --> SSR
    Normal --> SSR
    MetalRough --> SSR
    SSR --> BlendSSR

    BlendSSR --> TRAA
    Depth --> TRAA
    Velocity --> TRAA

    TRAA --> Final
```

---

## 📦 MRT (Multiple Render Targets)

`effects/` 内の `useScenePass` フックでシーンを一度レンダリングし、複数のテクスチャを同時に出力します。

```mermaid
flowchart LR
    subgraph MRT["TSL.mrt()"]
        direction TB
        output["output<br/>TSL.output"]
        normal["normal<br/>TSL.normalView"]
        metalrough["metalrough<br/>vec2(metalness, roughness)"]
        velocity["velocity<br/>TSL.velocity"]
    end

    subgraph Textures["取得テクスチャ"]
        color["color"]
        normalTex["normal"]
        depthTex["depth"]
        velocityTex["velocity"]
        metalRoughTex["metalRough"]
        sampledNormal["sampledNormal<br/>(サンプリング用)"]
    end

    MRT --> Textures
```

**用途:**
| テクスチャ | 用途 |
|-----------|------|
| `color` | シーンの描画結果 |
| `normal` | SSR/SSGIの反射・遮蔽計算 |
| `depth` | 深度テスト、レイマーチング |
| `velocity` | TRAAのモーションベクター |
| `metalRough` | SSRの反射強度制御 |

---

## 🌟 各エフェクトの説明

### SSGI (Screen Space Global Illumination)

```mermaid
flowchart LR
    subgraph Input
        Color["color"]
        Depth["depth"]
        Normal["sampledNormal"]
        Camera["camera"]
    end

    subgraph SSGI["ssgiNode"]
        GI["GI (rgb)<br/>間接光"]
        AO["AO (a)<br/>遮蔽"]
    end

    subgraph Composite["合成"]
        Formula["color × AO + color × GI"]
    end

    Input --> SSGI
    GI --> Formula
    AO --> Formula
```

**パラメータ:**
- `steps`: レイマーチのステップ数
- `radius`: サンプリング半径
- `giIntensity`: 間接光の強度
- `aoIntensity`: アンビエントオクルージョンの強度
- `thickness`: 深度判定の厚み

---

### SSR (Screen Space Reflections)

```mermaid
flowchart LR
    subgraph Input
        Color["color"]
        Depth["depth"]
        Normal["sampledNormal"]
        Metal["metalness"]
        Rough["roughness"]
    end

    subgraph SSR["ssrNode"]
        Reflect["反射計算"]
    end

    subgraph Output
        Reflection["反射画像"]
    end

    Input --> SSR --> Output
```

**パラメータ:**
- `maxDistance`: レイの最大距離
- `thickness`: 深度バッファの厚み判定
- `blurQuality`: 反射のブラー品質

---

### Bloom

```mermaid
flowchart LR
    Color["入力カラー"] --> Threshold["閾値フィルタ"]
    Threshold --> Blur["ガウスブラー"]
    Blur --> Add["加算合成"]
```

**パラメータ:**
- `threshold`: 発光する明るさの閾値
- `strength`: Bloomの強度
- `radius`: ブラーの半径

---

### TRAA (Temporal Reprojection Anti-Aliasing)

```mermaid
flowchart LR
    subgraph Input
        Color["現フレーム"]
        Depth["depth"]
        Velocity["velocity"]
        Camera["camera"]
    end

    subgraph TRAA["traaNode"]
        Reproject["前フレームを<br/>再投影"]
        Blend["ブレンド"]
    end

    subgraph Output
        AA["スムーズな画像"]
    end

    Input --> TRAA --> Output
```

**特徴:**
- モーションベクターを使用してゴーストを軽減
- ジッターパターンでサブピクセル精度

---

## 🎛️ Leva コントロール

各エフェクトは `useXXXControls()` フックでLevaパネルを提供します。

```mermaid
flowchart TB
    subgraph Leva["Leva Panel"]
        effects["effects (checkbox)"]
        subgraph SSRFolder["ssr"]
            distance["distance"]
        end
        subgraph SSGIFolder["ssgi"]
            steps["steps"]
            giIntensity["giIntensity"]
            aoIntensity["aoIntensity"]
            radius["radius"]
            thickness["thickness"]
        end
    end
```

---

## 🔧 新しいエフェクトの追加方法

1. `effects/` に新しいファイルを作成

```typescript
// 例: dof.ts (被写界深度)
import { dof as dofNode } from 'three/examples/jsm/tsl/display/DOFNode.js'
import type { ScenePassTextures } from './types'

export function createDOFPass(textures: ScenePassTextures, config: DOFConfig) {
  return dofNode(textures.color, textures.depth, /* ... */)
}

export function useDOFControls() {
  return useControls({ dof: folder({ /* ... */ }) })
}
```

2. メインの `Effects` コンポーネントでパイプラインに組み込む

```typescript
const dofPass = createDOFPass(textures, dofConfig)
const withDOF = TSL.blendColor(composited, dofPass)
```

3. `index.ts` でエクスポート

---

## 📚 参考リンク

- [Three.js WebGPU Examples](https://threejs.org/examples/?q=webgpu)
- [TSL (Three.js Shading Language)](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Leva Controls](https://github.com/pmndrs/leva)

---

## 💡 Tips

### TSLの基本

```typescript
import * as TSL from 'three/tsl'

// ノード作成
const color = TSL.vec4(1, 0, 0, 1)  // 赤色
const uv = TSL.uv()                  // UV座標

// 演算
const result = color.mul(0.5)        // 乗算
const added = color.add(other)       // 加算

// サンプリング
const sampled = texture.sample(uv)
```

### デバッグ

特定のテクスチャを直接表示してデバッグ:

```typescript
// 法線を表示
postProcessing.outputNode = textures.normal

// 深度を表示
postProcessing.outputNode = textures.depth
```

