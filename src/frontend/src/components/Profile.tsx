import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import APIService from "../services/APIService";
import AudioRecorder from "./AudioRecorder";

const Profile: React.FC = () => {
    const [user, setUser] = useState<{ username: string; profile_photo: string; motto: string }>({
        username: "",
        profile_photo: "",
        motto: "",
    });
    const [message, setMessage] = useState<string>("");
    const [showRecorder, setShowRecorder] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchUser = async () => {
        try {
            const data = await APIService.request("/user", "GET", null, true);
            setUser({
                username: data.username,
                profile_photo: data.profile_photo,
                motto: data.motto,
            });
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleUploadSuccess = (message: string) => {
        setMessage(message);
        setShowRecorder(false);
        fetchUser();
    };

    return (
        <Container maxWidth="sm">
            <Box mt={4} display="flex" flexDirection="column" alignItems="center">
                <Avatar src={user.profile_photo} sx={{ width: 100, height: 100 }} />
                <Typography variant="h5" component="h2" mt={2}>
                    {user.username}
                </Typography>
                <Typography variant="h6" component="p" mt={4} mb={4}>
                    "{user.motto}"
                </Typography>
                {message && <Typography color="error">{message}</Typography>}
                <Box display="flex" justifyContent="space-between" width="100%" mt={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowRecorder(true)}
                        sx={{ backgroundColor: 'green', color: 'white' }}
                    >
                        Record (New) Motto
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleLogout}
                        sx={{ backgroundColor: 'red', color: 'white' }}
                    >
                        Logout
                    </Button>
                </Box>
                {showRecorder && (
                    <Box mt={4}>
                        <AudioRecorder onUploadSuccess={handleUploadSuccess} />
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Profile;
