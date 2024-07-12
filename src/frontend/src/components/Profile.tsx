import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
    const [user, setUser] = useState<{ username: string; profile_photo: string; motto: string }>({
        username: "",
        profile_photo: "",
        motto: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                const response = await fetch("http://localhost:3002/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setUser({
                        username: data.username,
                        profile_photo: data.profile_photo,
                        motto: data.motto,
                    });
                }
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
