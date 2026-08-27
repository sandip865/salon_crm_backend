const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Role = require('../models/role.model');

const generateTokens = (user, roleName) => {
  const payload = { id: user._id, role: roleName, clientId: user.clientId };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email, isDeleted: false }).populate('role').populate('salons');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user, user.role.name);

    res.json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        permissions: user.role.permissions,
        clientId: user.clientId,
        salonId: user.salonId,
        salons: user.salons
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({ 
        error: 'Public registration is disabled. Super Admin will create Customer (Salon Owner) accounts.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    if (!superAdminRole) {
      return res.status(500).json({ error: 'Roles not seeded. Please run seed script first.' });
    }

    const user = await User.create({ 
      email, 
      password, 
      name,
      role: superAdminRole._id, 
      salonId: null
    });

    const { accessToken, refreshToken } = generateTokens(user, superAdminRole.name);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: superAdminRole.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    
    // Find user
    const user = await User.findById(decoded.id).populate('role');
    if (!user || user.isDeleted) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    // Generate new tokens
    const tokens = generateTokens(user, user.role.name);
    
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
