import React, { useRef, useState, useEffect } from "react";
import { drawHand } from "./utils";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import * as fp from "fingerpose";
import cocoSsd from '@tensorflow-models/coco-ssd'

// imoprt most 
import * as tf from "@tensorflow/tfjs";
import "./App.css";
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'


// image
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";
import dislike from "./dislike.png";
import hello from "./hello.png";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [imgView, setImgView] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory, thumbs_down: dislike, hiHand: hello };


  // add fingerpose

  const thumbsDownGesture = new fp.GestureDescription('thumbs_down');
  thumbsDownGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
  thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalDown, 1.0);
  thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownLeft, 0.9);
  thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownRight, 0.9);

  for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    thumbsDownGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    thumbsDownGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
  }

  const hiHand = new fp.GestureDescription('hiHand')
  hiHand.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
  hiHand.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);
  hiHand.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpLeft, 0.9);
  hiHand.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpRight, 0.9);

  for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    hiHand.addCurl(finger, fp.FingerCurl.NoCurl, 0.9);
  }
  const runHandpose = async () => {
    const net = await handpose.load();
    // const model = await cocoSsd.load();
    setInterval(() => {
      detect(net);
      // objetFinder(model)
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          hiHand,
          thumbsDownGesture
        ]);

        const gesture = await GE.estimate(hand[0].landmarks, 8.5);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {

          const confidence = gesture.gestures.map(
            (prediction) => {
              return prediction.score
            }
          );

          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          setImgView(gesture.gestures[maxConfidence].name);
        }
      } else {
        setImgView('')
      }

      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  // const objetFinder = async (model) => {

  //   // Classify the image.
  //   const predictions = await model.detect(webcamRef);

  //   console.log('Predictions: ');
  //   console.log(predictions);
  // }

  useEffect(() => { runHandpose() }, []);

  return (
    <div className='App'>
      <header className='App-header'>
        <Webcam ref={webcamRef} className='webcam' />
        <canvas ref={canvasRef} className='canvas' />

        {imgView !== null ? (
          <img
            src={images[imgView]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
              zIndex: 999
            }}
          />
        ) : (
          ""
        )}
      </header>
    </div>
  )
}
export default App