import React, { useState, useRef, useEffect } from "react";
import { Button, Container, Typography, Box, CircularProgress } from "@mui/material";

interface RecorderProps {
    onUploadSuccess: (message: string, motto: string) => void;
}

const AudioRecorder: React.FC<RecorderProps> = ({ onUploadSuccess }) => {
    const [recording, setRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [message, setMessage] = useState<string>("");
    const [seconds, setSeconds] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const timerRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (recording) {
            timerRef.current = window.setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [recording]);

    const handleStartRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
                setMediaRecorder(recorder);
                setRecording(true);
                setSeconds(0);
                recorder.start();

                const audioChunks: Blob[] = [];

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    setRecording(false);
                    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                    setAudioBlob(audioBlob);
                    if (audioRef.current) {
                        audioRef.current.src = URL.createObjectURL(audioBlob);
                        audioRef.current.currentTime = 0;
                    }
                };

                setTimeout(() => {
                    if (recorder.state === "recording") {
                        recorder.stop();
                    }
                }, 15000); // Stop recording after 15 seconds
            })
            .catch((err) => {
                console.error("Error accessing media devices.", err);
                setMessage("Error accessing media devices.");
            });
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    };

    const handleUpload = async () => {
        if (audioBlob) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            try {
                const token = localStorage.getItem("token");  // 获取存储的JWT令牌
                if (!token) {
                    setMessage("No authentication token found. Please login again.");
                    setIsUploading(false);
                    return;
                }

                const response = await fetch("http://localhost:3002/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
                if (response.status === 401) {
                    setMessage("Unauthorized. Please login again.");
                    setIsUploading(false);
                    return;
                }
                const data = await response.json();
                setMessage(data.message);
                setIsUploading(false);
                onUploadSuccess(data.message, data.motto);  // 调用上传成功的回调函数，并传递新的motto
            } catch (error) {
                console.error("Failed to upload audio", error);
                setMessage("Failed to upload audio");
                setIsUploading(false);
            }
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h5" component="h2" gutterBottom>
                Audio Recorder
            </Typography>
            <Box display="flex" justifyContent="center" mb={2}>
                <Typography variant="body1">{seconds} seconds</Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                onClick={handleStartRecording}
                disabled={recording || isUploading}
            >
                Start Recording
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleStopRecording}
                disabled={!recording || isUploading}
            >
                Stop Recording
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!audioBlob || isUploading}
            >
                Upload
            </Button>
            {isUploading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress />
                    <Typography variant="body1" ml={2}>Uploading...</Typography>
                </Box>
            )}
            <audio ref={audioRef} controls>
                <source src={audioBlob ? URL.createObjectURL(audioBlob) : ""} type="audio/webm" />
            </audio>
            {message && <Typography color="error">{message}</Typography>}
        </Container>
    );
};

export default AudioRecorder;
