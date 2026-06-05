import './webcam.css';
import Webcam from 'react-webcam';
import { DrawingUtils, HandLandmarker, FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';
import  useGestureDetection  from '../hooks/useGestureDetection.js';


function WebcamCanvas() {
    //Call the custom hook to set up gesture detection and drawing on the canvas.
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
  

    const { left, right } = useGestureDetection(webcamRef, canvasRef);
    console.log("My current gestures are:", left, right);

    return (
        <div className="webcam-container">
            <Webcam ref={webcamRef}
                className="webcam-feed"
                audio={false}
                width={400}
                height={300}
                videoConstraints={{ facingMode: "user" }}
            />
            <div>
                <p>Right hand: {right}</p>
                <p>left hand: {left}</p>
            </div>
            {/* The canvas sits directly on top of the webcam feed. */}
            <canvas ref={canvasRef} className="webcam-canvas" />
        </div>
    );
}

export default WebcamCanvas;