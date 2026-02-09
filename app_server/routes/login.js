const express = require('express');
const router = express.Router();
const controller = require('../controllers/login');

// GET login page
router.get('/', controller.login);

// POST login form
router.post('/', controller.loginSubmit);

// GET logout
router.get('/logout', controller.logout);

module.exports = router;
