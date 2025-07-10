// client/src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route , useParams } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyGigs from "./pages/MyGigs";
import Gigs from "./pages/Gigs";
import GigDetails from "./pages/GigDetails";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import { io } from "socket.io-client";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AddGig from "./pages/AddGig";

const socket = io("http://localhost:5000");

const user = JSON.parse(localStorage.getItem("user") || "null");
const userId = user?._id; //  Safe access

socket.emit("join", userId);

const ChatWrapper = () => {
  const { id } = useParams();
  return <Chat receiverId={id} />;
};

function App() {
  return (
    <Router>
    <Navbar /> {/* ✅ Appears on every page */}
        <Routes>
          <Route path="/" element={<h2 className="text-center text-2xl">Welcome to Freelance Marketplace</h2>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-gigs" element={<MyGigs />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/gig/:id" element={<GigDetails />} />
          <Route path="/add-gig" element={<AddGig />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/chat/:id" element={<ChatWrapper />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
        </Routes>
    </Router>
  );
}

export default App;
