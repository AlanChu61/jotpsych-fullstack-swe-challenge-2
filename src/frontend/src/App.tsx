import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import Logout from "./components/Logout";
import Profile from "./components/Profile";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/profile" element={<Profile />} /> {/* Add the Profile route */}
    </Routes>
  );
}

export default App;
