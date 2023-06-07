"use client";

import React, { useRef, useState, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

export default function Home() {
  const videoRef = useRef();
  const [model, setModel] = useState(undefined);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    (async function loadModel() {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      // await model.save("downloads://my-model-1");
      // console.log(JSON.stringify(await tf.io.listModels()));
    })();
  }, []);
  // console.log("model", model);

  const enableCam = (event) => {
    if (!model) {
      return;
    }
    event.target.classList.add("removed");
    const constraints = {
      video: true,
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    });
  };

  // save the model
  const saveModel = async () => {
    await model.save("downloads://my-model-1");
    console.log(JSON.stringify(await tf.io.listModels()));
  };

  const predictWebcam = () => {
    model.detect(videoRef.current).then(function (predictions) {
      const newChildren = [];
      for (let n = 0; n < predictions.length; n++) {
        if (predictions[n].score > 0.66) {
          const pText =
            predictions[n].class +
            " - with " +
            Math.round(parseFloat(predictions[n].score) * 100) +
            "% confidence.";
          newChildren.push({
            bbox: predictions[n].bbox,
            text: pText,
          });
        }
      }
      setChildren(newChildren);
      window.requestAnimationFrame(predictWebcam);
    });
  };

  return (
    <div>
      <h1>
        Multiple object detection using pre trained model in TensorFlow.js
      </h1>
      <p>
        Wait for the model to load before clicking the button to enable the
        webcam - at which point it will become visible to use.
      </p>
      <div id="liveView" className="camView">
        <button id="webcamButton" onClick={enableCam}>
          Enable Webcam
        </button>
        <video
          id="webcam"
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
        ></video>
        {children.map((child, i) => (
          <div
            key={i}
            className="highlighter"
            style={{
              left: child.bbox[0],
              top: child.bbox[1],
              width: child.bbox[2],
              height: child.bbox[3],
            }}
          >
            <p
              style={{
                marginLeft: child.bbox[0],
                marginTop: child.bbox[1] - 10,
                width: child.bbox[2] - 10,
              }}
            >
              {child.text}
            </p>
          </div>
        ))}
      </div>
      <button id="saveModel" onClick={saveModel}>
        Save Model
      </button>
    </div>
  );
}
