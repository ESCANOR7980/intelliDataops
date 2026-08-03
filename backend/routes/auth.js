const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    user = new User({
      name,
      email: normalizedEmail,
      password,
      role: role || 'viewer',
      department
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n========== LOGIN DEBUG ==========');
    console.log('EMAIL RECEIVED:', JSON.stringify(email));
    console.log('PASSWORD RECEIVED:', password ? 'YES' : 'NO');

    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select('+password');

    console.log('USER FOUND:', !!user);

    if (!user) {
      console.log('❌ USER NOT FOUND');

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('USER EMAIL FROM DB:', user.email);
    console.log('PASSWORD HASH EXISTS:', !!user.password);

    const isMatch = await user.comparePassword(password);

    console.log('PASSWORD MATCH:', isMatch);
    console.log('================================\n');

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (err) {
    console.error('❌ LOGIN ERROR:', err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// @GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name code category')
      .select('-password');

    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error('ME ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// @GET /api/auth/users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find()
      .populate('department', 'name code')
      .select('-password')
      .sort('-createdAt');

    res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (err) {
    console.error('USERS ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;