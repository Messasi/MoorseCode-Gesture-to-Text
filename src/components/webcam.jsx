import './webcam.css';
import Webcam from 'react-webcam';
import { DrawingUtils, HandLandmarker, FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';
import { useGestureDetection } from '../hooks/useGestureDetection.js';

function WebcamCanvas() {
    //Call the custom hook to set up gesture detection and drawing on the canvas.
    const webcameRef = useRef(null);
    const canvasRef = useRef(null);
    const gestureRecognizer = useRef(null);
    useGestureDetection(webcameRef, canvasRef, gestureRecognizer);
    return (
        <div className="webcam-container">
            <Webcam ref={webcameRef}
                className="webcam-feed"
                audio={false}
                width={400}
                height={300}
                videoConstraints={{ facingMode: "user" }}
            />
            {/* The canvas sits directly on top of the webcam feed. */}
            <canvas ref={canvasRef} className="webcam-canvas" />
        </div>
    );
}

export default WebcamCanvas;