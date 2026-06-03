 //import dependecies
 import {useEffect, useRef} from 'react';
 import { DrawingUtils, HandLandmarker, FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
 
 // This custom hook encapsulates the gesture detection logic, making it reusable across components.
 export function useGestureDetection(webcameRef, canvasRef, gestureRecognizer) {
    

   

    useEffect(() => {
        let animationFrameId; // Track the loop ID so we can cancel it on cleanup.

        //setup async function to initialize the AI and start the loop.
        const setup = async () => {
            // Initialize the MediaPipe vision task engine (FilesetResolver).
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );

            // Create the recognizer with the specified model and options.
            gestureRecognizer.current = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO"
            });

            //set the cavans size to match the webcam feed.
            if (canvasRef.current) {
                canvasRef.current.width = 400;
                canvasRef.current.height = 300;
            }

            //renderLoop is the recursive function called by the browser's refresh rate.
            function renderLoop() {
                const video = webcameRef.current?.video;
                const canvasCtx = canvasRef.current?.getContext('2d');

                // Check if AI is ready AND video is playing
                if (gestureRecognizer.current && video?.readyState === 4 && canvasCtx) {
                    // Process the current frame to get landmarks.
                    const results = gestureRecognizer.current.recognizeForVideo(video, Date.now());
                    
                    // Clear previous frame drawing.
                    canvasCtx.clearRect(0, 0, 400, 300);

                    // If hands are detected, loop through them.
                    if (results.landmarks) {
                        // DrawingUtils MUST be instantiated with the context.
                        const drawingUtils = new DrawingUtils(canvasCtx);
                        for (const landmarks of results.landmarks) {
                            // Draw the skeleton lines.
                            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
                            // Draw the points (nodes).
                            drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 2 });
                        }
                    }
                }
                // Schedule the next frame update.
                animationFrameId = requestAnimationFrame(renderLoop);
            }
            
            // Start the loop after everything is loaded.
            renderLoop();
        };

        setup();

        //stop the loop when the component is removed to prevent memory leaks.
        return () => cancelAnimationFrame(animationFrameId);
    }, [webcameRef, canvasRef, gestureRecognizer]);

 }

