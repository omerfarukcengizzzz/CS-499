const express = require('express');
const router = express.Router();
const controller = require('../controllers/register');

// GET register page
router.get('/', controller.register);

// POST register form
router.post('/', controller.registerSubmit);

module.exports = router;
