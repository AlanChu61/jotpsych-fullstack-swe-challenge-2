import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      // Assuming you store the token in localStorage
      const token = localStorage.getItem("token");

      if (token) {
        const response = await fetch("http://localhost:3002/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <h2>Home</h2>
      {username ? (
        <div>
          <p>Welcome, {username}!</p>
          <Link to="/logout">Logout</Link>
        </div>
      ) : (
        <p>
          Please <Link to="/login">login</Link> or{" "}
          <Link to="/register">register</Link>.
        </p>
      )}
    </div>
  );
}

export default Home;
