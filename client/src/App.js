// client/src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-600">FIverr</h1>
        <div className="flex gap-4">
          <Link to="/" className="text-gray-700 hover:text-green-600">Home</Link>
          <Link to="/register" className="text-gray-700 hover:text-green-600">Register</Link>
          <Link to="/login" className="text-gray-700 hover:text-green-600">Login</Link>
        </div>
      </nav>

      <div className="p-6">
        <Routes>
          <Route path="/" element={<h2 className="text-center text-2xl">Welcome to Freelance Marketplace</h2>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
