import {useRef,useEffect,useState} from 'react'  // useState 추가
import './App.css'  
import * as faceapi from 'face-api.js'

function App(){
  const videoRef = useRef()  
  const canvasRef = useRef()
  const videoContainerRef = useRef()  // videoContainerRef 추가
  const [faceDetected, setFaceDetected] = useState(false)  // faceDetected 상태 추가

  useEffect(()=>{
    startVideo() 
    videoRef && loadModels() 

  },[])

  const startVideo = ()=>{
    navigator.mediaDevices.getUserMedia({video:true})  
    .then((currentStream)=>{
      videoRef.current.srcObject = currentStream  
    })
    .catch((err)=>{
      console.log(err)  
    })
  }

  const loadModels = ()=>{
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),  
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),  
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),  
      faceapi.nets.faceExpressionNet.loadFromUri("/models")  
    ]).then(()=>{
      faceMyDetect() 
    })
  }

  const faceMyDetect = ()=>{
    setInterval(async()=>{
        const detections = await faceapi.detectAllFaces(videoRef.current,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

        canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
        faceapi.matchDimensions(canvasRef.current,{
            width:940,
            height:650
        })

        const resized = faceapi.resizeResults(detections,{
            width:940,
            height:650
        })

        faceapi.draw.drawDetections(canvasRef.current,resized)
        faceapi.draw.drawFaceLandmarks(canvasRef.current,resized)
        faceapi.draw.drawFaceExpressions(canvasRef.current,resized)

        // 감지된 얼굴 표정에 따라 배경색 변경
        if (detections.length > 0) {
            const expressions = detections[0].expressions
            if (expressions.surprised > 0.7) {
                document.body.style.backgroundColor = 'yellow'
            } else if (expressions.disgusted > 0.7) {
                document.body.style.backgroundColor = 'brown'
            } else if (expressions.fearful > 0.7) {
                document.body.style.backgroundColor = 'purple'
            } else if (expressions.sad > 0.7) {
                document.body.style.backgroundColor = 'black'
            } else if (expressions.angry > 0.7) {
                document.body.style.backgroundColor = 'red'
            } else if (expressions.happy > 0.7) {
                document.body.style.backgroundColor = 'green'
            } else if (expressions.neutral > 0.7) {
              document.body.style.backgroundColor = 'blue'
          }
        }
    },1000)
}


  return (
    <div className={`myapp ${faceDetected ? 'face-detected' : ''}`}>  {/* face-detected 클래스 추가 */}
      <h1>얼굴인식테스트</h1>
      <div ref={videoContainerRef} className="appvideo">  {/* ref 추가 */}
        <video className={faceDetected ? 'video-face-detected' : ''} crossOrigin="anonymous" ref={videoRef} autoPlay></video>  {/* face-detected 상태에 따라 클래스 추가 */}
      </div>
      <canvas ref={canvasRef} width="940" height="650"
      className="appcanvas"></canvas>
    </div>
  )
}

export default App;
