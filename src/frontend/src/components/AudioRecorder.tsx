import React, { useState, useRef } from "react";
import { Button, Container, Typography } from "@mui/material";
import APIService from "../services/APIService";

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
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
                const response = await APIService.request("/upload", "POST", formData, true);
                const data = await response.json();
                setMessage(data.message);
                onUploadSuccess(data.message);
            } catch (error) {
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
