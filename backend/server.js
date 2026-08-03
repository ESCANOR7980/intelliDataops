const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ 
  origin: ['http://localhost:5173', 'https://intelli-dataops.vercel.app'], 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/datasources', require('./routes/dataSources'));
app.use('/api/pipelines', require('./routes/pipelines'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/policies', require('./routes/policies'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), service: 'IntelliDataOps' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// Connect DB and start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch(err => { console.error('❌ DB Error:', err); process.exit(1); });