const User = require('../models/User');
const mockProfiles = require('../config/mockProfiles');

const validateAadhaar = (aadhaarId) => /^\d{12}$/.test(aadhaarId || '');

const register = async (req, res, next) => {
  try {
    const { aadhaarId, phone = '', address = '' } = req.body;

    if (!validateAadhaar(aadhaarId)) {
      res.status(400);
      throw new Error('Aadhaar ID must be exactly 12 digits.');
    }

    const mockProfile = mockProfiles[aadhaarId];
    if (!mockProfile) {
      res.status(404);
      throw new Error('Mock Aadhaar details not found.');
    }

    let user = await User.findOne({ aadhaarId });
    if (!user) {
      user = await User.create({
        ...mockProfile,
        phone,
        address,
      });
      return res.status(201).json(user);
    }

    if (phone || address) {
      user.phone = phone || user.phone;
      user.address = address || user.address;
      await user.save();
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { aadhaarId } = req.body;

    if (!validateAadhaar(aadhaarId)) {
      res.status(400);
      throw new Error('Aadhaar ID must be exactly 12 digits.');
    }

    const user = await User.findOne({ aadhaarId });
    if (!user) {
      res.status(404);
      throw new Error('User not found. Please register first.');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const previewIdentity = async (req, res, next) => {
  try {
    const { aadhaarId } = req.params;

    if (!validateAadhaar(aadhaarId)) {
      res.status(400);
      throw new Error('Aadhaar ID must be exactly 12 digits.');
    }

    const mockProfile = mockProfiles[aadhaarId];
    if (!mockProfile) {
      res.status(404);
      throw new Error('Mock Aadhaar details not found.');
    }

    res.json(mockProfile);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  previewIdentity,
  getUserById,
  listUsers,
};
