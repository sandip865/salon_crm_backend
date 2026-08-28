const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, phone, role, salonId } = req.body;
    const reqSalonId = salonId || req.headers['x-salon-id'] || null;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (reqSalonId) {
        if (!existingUser.salons) existingUser.salons = [];
        if (!existingUser.salons.includes(reqSalonId)) {
          existingUser.salons.push(reqSalonId);
        }
        existingUser.password = password;
        existingUser.name = name;
        existingUser.phone = phone;
        existingUser.role = role;
        await existingUser.save();
        return res.status(200).json({ success: true, data: existingUser, message: 'User updated with new salon access' });
      }
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ email, password, name, phone, role, salonId: reqSalonId, salons: reqSalonId ? [reqSalonId] : [] });
    res.status(201).json({ success: true, data: { id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const query = { isDeleted: false };
    const salonId = req.query.salonId || req.headers['x-salon-id'];
    if (salonId) {
      query.$or = [{ salonId: salonId }, { salons: salonId }];
    }
    const users = await User.find(query).populate('role', 'name').populate('salons', 'name').select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
