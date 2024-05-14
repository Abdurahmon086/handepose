import { useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as handpose from '@tensorflow-models/handpose'
import Webcam from 'react-webcam'
import './App.css'
import { drawHand } from './utils'

const App = () => {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const runHanpose = async () => {
    const net = await handpose.load()
    setInterval(() => {
      detect(net)
    }, 10)
  }

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight


      const hand = await net.estimateHands(video)

      const ctx = canvasRef.current.getContext('2d')
      drawHand(hand, ctx)
    }
  }

  useEffect(() => {
    runHanpose()
  }, [])

  return (
    <div className='App'>
      <header className='App-header'>
        <Webcam ref={webcamRef} className='webcam' />
        <canvas ref={canvasRef} className='canvas' />
      </header>
    </div>
  )
}
export default App