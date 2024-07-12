import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import APIService from "../services/APIService";

const Profile: React.FC = () => {
    const [user, setUser] = useState<{ username: string; profile_photo: string; motto: string }>({
        username: "",
        profile_photo: "",
        motto: "",
    });
    const [message, setMessage] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
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

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
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
                <Box display="flex" justifyContent="space-between" width="100%">
                    <Button variant="contained" color="primary">
                        Record (New) Motto
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;
