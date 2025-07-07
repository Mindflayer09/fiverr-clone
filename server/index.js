// index.js

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// ✅ Import route files
import authRoutes from './routes/Auth.js'; // <-- fix casing to match file name

// ✅ Load environment variables
dotenv.config();

// ✅ Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes); // <-- mount auth route

// ✅ Test route
app.get('/', (req, res) => {
  res.send('API is working...');
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    // ✅ Start server only after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
