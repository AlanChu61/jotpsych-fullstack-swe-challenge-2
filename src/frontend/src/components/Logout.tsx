import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                const response = await fetch("http://localhost:3002/logout", {
                    method: "POST",
                    credentials: "include",
                });
                if (response.ok) {
                    navigate("/login");
                } else {
                    console.error("Logout failed");
                }
            } catch (error) {
                console.error("Logout failed", error);
            }
        };

        performLogout();
    }, [navigate]);

    return <div>Logging out...</div>;
};

export default Logout;
