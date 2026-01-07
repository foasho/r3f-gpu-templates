import { Suspense, useState } from 'react'
import { Loader } from '@react-three/drei'
import { R3FCanvas } from './canvas/canvas'
import { MainScene, LivingRoomScene } from './scenes'
import './App.css'

const scenes = {
  court: { name: 'Basketball Court', component: MainScene },
  livingRoom: { name: 'Living Room', component: LivingRoomScene },
} as const

type SceneKey = keyof typeof scenes

export default function App() {
  const [currentScene, setCurrentScene] = useState<SceneKey>('livingRoom')
  const SceneComponent = scenes[currentScene].component

  return (
    <>
      <R3FCanvas>
        <Suspense fallback={null}>
          <SceneComponent />
        </Suspense>
      </R3FCanvas>
      
      {/* シーン切り替えUI */}
      <div className="scene-switcher">
        {Object.entries(scenes).map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => setCurrentScene(key as SceneKey)}
            className={currentScene === key ? 'active' : ''}
          >
            {name}
          </button>
        ))}
      </div>

      <Loader />
    </>
  )
}
