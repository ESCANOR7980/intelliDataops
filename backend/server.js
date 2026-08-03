require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');

const app = express();


// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://intelli-dataops-mdyqgix3j-abhi-353a.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Allow known frontend URLs
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('❌ CORS blocked:', origin);

      return callback(new Error('Not allowed by CORS'));
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IntelliDataOps Backend API is running',
    status: 'OK'
  });
});


// =====================================================
// AUTH ROUTES
// =====================================================

app.use('/api/auth', authRoutes);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy blocked this request'
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});


// =====================================================
// MONGODB CONNECTION + SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Error:', err);
    process.exit(1);
  });