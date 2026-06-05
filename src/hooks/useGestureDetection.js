        //import dependecies
        import {useEffect, useRef, useState} from 'react';
        import { DrawingUtils, HandLandmarker, FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
        
        //hook to move it between componenets 
        export default function useGestureDetection(webcamRef, canvasRef) {
            
            //use ref to not crash , and use state to hold gesture result
            const gestureRecognizer = useRef(null)
            const [gesture, setGesture] = useState({left: null, right: null})

            useEffect(() => {

                
                let animationFrameId; 

                //Identify Gesture function
                    function identifyGesture(results) {
                        const newGestures = {
                            left: null,
                            right: null
                        };

                        for (let i = 0; i < results.gestures.length; i++) {

                            if (results.handedness[i] === undefined) {
                                continue;
                            }

                            const handInfo = results.handedness[i];
                            const gestureInfo = results.gestures[i];

                            if (handInfo.length === 0 || gestureInfo.length === 0) {
                                continue;
                            }

                            const hand = handInfo[0].displayName.toLowerCase();
                            const gesture = gestureInfo[0].categoryName;

                            newGestures[hand] = gesture;
                            console.log(results);
                            console.log(results.gestures);
                            console.log(results.handedness);
                        }

                        setGesture(newGestures);
                    }
                //Drawing Function
                function drawVisuals(canvasCtx, results){
                    canvasCtx.clearRect(0, 0, 400, 300);

                                // If hands are detected, loop through them.
                        if (results.landmarks) {
                                    // DrawingUtils MUST be instantiated with the context.
                            const drawingUtils = new DrawingUtils(canvasCtx);

                            for (const landmarks of results.landmarks) {
                                        // Draw the skeleton lines.
                                drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                                        // Draw the points (nodes).
                                drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 1 });
                            }
                        }
                }
                
                //setup async function to initialize the AI and start the loop.
                const setup = async () => {

                    // Initialise the MediaPipe vision task engine 
                    const vision = await FilesetResolver.forVisionTasks(
                        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                    );

                    // Create the recognizer with the specified model and options.
                    gestureRecognizer.current = await GestureRecognizer.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                            delegate: "GPU"
                        },
                        numHands: 2,
                        runningMode: "VIDEO",
                        minHandDetectionConfidence: 0.7
                    });

                    //set the cavans size to match the webcam feed.
                    if (canvasRef.current) {
                        canvasRef.current.width = 400;
                        canvasRef.current.height = 300;
                    }

                
                    function renderLoop() {
                        const video = webcamRef.current?.video;
                        const canvasCtx = canvasRef.current?.getContext('2d');

                            // Check if AI is ready AND video is playing
                            if (gestureRecognizer.current && video?.readyState === 4 && canvasCtx) {
                                // Process the current frame to get landmarks.
                            const results = gestureRecognizer.current.recognizeForVideo(video, Date.now());

                            drawVisuals(canvasCtx,results);
                            if(results.gestures.length > 0){
                                identifyGesture(results)
                            }
                        }
                        animationFrameId = requestAnimationFrame(renderLoop);
                    }
                    // Start the loop after everything is loaded.
                    renderLoop();
                };
                setup();
                //stop the loop when the component is removed to prevent memory leaks.
                return () => cancelAnimationFrame(animationFrameId);

            }, [webcamRef, canvasRef, gestureRecognizer]);

            //Returning the gesture
            return gesture;
        }