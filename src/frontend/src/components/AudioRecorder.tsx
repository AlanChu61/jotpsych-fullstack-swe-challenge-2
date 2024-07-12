import React, { useState, useRef } from "react";
import { Button, Container, Typography } from "@mui/material";

interface RecorderProps {
    onUploadSuccess: (message: string) => void;
}

const AudioRecorder: React.FC<RecorderProps> = ({ onUploadSuccess }) => {
    const [recording, setRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [message, setMessage] = useState<string>("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleStartRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
                setMediaRecorder(recorder);
                setRecording(true);
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
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            try {
                const token = localStorage.getItem("token");  // 获取存储的JWT令牌
                const response = await fetch("http://localhost:3002/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
                const data = await response.json();
                setMessage(data.message);
                onUploadSuccess(data.message);
            } catch (error) {
                console.error("Failed to upload audio", error);
                setMessage("Failed to upload audio");
            }
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h5" component="h2" gutterBottom>
                Audio Recorder
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleStartRecording}
                disabled={recording}
            >
                Start Recording
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleStopRecording}
                disabled={!recording}
            >
                Stop Recording
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!audioBlob}
            >
                Upload
            </Button>
            <audio ref={audioRef} controls />
            {message && <Typography color="error">{message}</Typography>}
        </Container>
    );
};

export default AudioRecorder;
