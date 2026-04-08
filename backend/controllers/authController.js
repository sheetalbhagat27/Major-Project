// ============================================
// Auth Controller
// Handles teacher login and JWT generation
// ============================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

// @desc    Login teacher & get token
// @route   POST /api/auth/login
const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password using bcrypt directly (works whether data
    // was seeded via Mongoose model or native MongoDB driver)
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Return token and teacher info
    res.json({
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        designation: teacher.designation,
        profileImage: teacher.profileImage,
        role: teacher.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { loginTeacher };
