// ============================================
// Auth Routes
// ============================================

const express = require('express');
const router = express.Router();
const { loginTeacher } = require('../controllers/authController');

// POST /api/auth/login — Teacher login
router.post('/login', loginTeacher);

module.exports = router;
