import React, { useRef, useEffect, useState } from 'react';

const CameraCapture = ({ onCapture, autoCapture = false, interval = 1000 }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        let timer;
        if (autoCapture && stream) {
            timer = setInterval(() => {
                captureImage();
            }, interval);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [autoCapture, stream, interval]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    onCapture(blob); // Pass blob to parent
                }
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <div className="camera-container">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', borderRadius: '0.5rem', transform: 'scaleX(-1)' }}
            />
            {!autoCapture && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={captureImage}>
                        Take Photo
                    </button>
                </div>
            )}
        </div>
    );
};

export default CameraCapture;
