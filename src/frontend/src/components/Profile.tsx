import React, { useState, useEffect } from "react";
import { Container, Typography, Box, TextField, Button } from "@mui/material";

function Profile() {
    const [user, setUser] = useState<{ username: string }>({
        username: "",
    });

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
                    setUser({ username: data.username });
                }
            }
        };

        fetchUser();
    }, []);

    return (
        <Container maxWidth="sm">
            <Box mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    User Profile
                </Typography>
                <Box mb={2}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={user.username}
                        disabled
                    />
                </Box>
                <Button variant="contained" color="primary">
                    Update Profile
                </Button>
            </Box>
        </Container>
    );
}

export default Profile;
