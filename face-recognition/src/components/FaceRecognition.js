// src/components/FaceRecognition.js
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './FaceRecognition.css'; // CSS 파일을 임포트합니다.

const FaceRecognition = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [borderClass, setBorderClass] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      await faceapi.loadFaceExpressionModel(MODEL_URL);
      setIsModelLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startWebcam = async () => {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    };

    startWebcam();
  }, [isModelLoaded]);

  useEffect(() => {
    const detectFace = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        isModelLoaded
      ) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 512, // 입력 이미지 크기
            scoreThreshold: 0.5 // 최소 검출 점수
          })
        ).withFaceLandmarks().withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          if (expressions.happy > 0.6) {
            setBorderClass('joy');
          } else if (expressions.sad > 0.6) {
            setBorderClass('sadness');
          } else if (expressions.angry > 0.6) {
            setBorderClass('anger');
          } else if (expressions.disgusted > 0.6) {
            setBorderClass('disgust');
          } else if (expressions.surprised > 0.6) {
            setBorderClass('embrassment');
          } else if (expressions.fearful > 0.6) {
            setBorderClass('fear');
          } else if (expressions.neutral > 0.6) {
            setBorderClass('ennui');
          }
        }

        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        };

        if (canvasRef.current) {
          // 2D 컨텍스트를 생성할 때 willReadFrequently 속성을 true로 설정
          const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
          faceapi.matchDimensions(canvasRef.current, displaySize);

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
        }
      }
    };

    const interval = setInterval(() => {
      detectFace();
    }, 1000);

    return () => clearInterval(interval);
  }, [isModelLoaded]);

  return (
    <div className='myapp'>
      <h1>Face Recognition using WebRTC</h1>
      <div className='appvide'>
        <video
          ref={videoRef}
          className={`video-feed ${borderClass}`}
          autoPlay
          muted
        />

      </div>
      <canvas ref={canvasRef} width="720" height="560" className="appcanvas"></canvas>
    </div>
  );
};

export default FaceRecognition;
