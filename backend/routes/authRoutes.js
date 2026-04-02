const express = require('express');
const { register, login, previewIdentity, getUserById, listUsers } = require('../controllers/authController');

const router = express.Router();

router.get('/identity/:aadhaarId', previewIdentity);
router.get('/users', listUsers);
router.get('/users/:userId', getUserById);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
