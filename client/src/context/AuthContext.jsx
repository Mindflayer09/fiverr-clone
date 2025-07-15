// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch (err) {
        console.error("❌ Failed to parse user from storage:", err);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = ({ user, token, remember }) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(user));
    storage.setItem("token", token);
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  const userId = user?._id || null;

  return (
    <AuthContext.Provider value={{ user, token, userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
