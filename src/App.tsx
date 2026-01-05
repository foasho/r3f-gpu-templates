import { Suspense } from 'react'
import { Loader } from '@react-three/drei'
import { R3FCanvas } from './canvas/canvas'
import { MainScene } from './scenes'
import './App.css'

export default function App() {
  return (
    <>
      <R3FCanvas>
        <Suspense fallback={null}>
          <MainScene />
        </Suspense>
      </R3FCanvas>
      <Loader />
    </>
  )
}
