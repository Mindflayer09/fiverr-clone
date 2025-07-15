import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap your app with AuthProvider */}
      <App />
      <ToastContainer position="top-center" />
    </AuthProvider>
  </React.StrictMode>
);

// Optional: for performance measurement
reportWebVitals();
