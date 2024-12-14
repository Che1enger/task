const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MongoDB connection with serverless optimizations
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  console.log('Creating new database connection');
  try {
    const client = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 10000, // Timeout after 10 seconds
    });

    cachedDb = client;
    console.log('Database connected successfully');
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
const influencerRoutes = require('./routes');
app.use('/api/influencers', influencerRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Only start server if not in production (Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;