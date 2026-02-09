const express = require('express');
const router = express.Router();
const controller = require('../controllers/account');

router.get('/', controller.accountPage);
router.post('/update', controller.updateProfile);
router.get('/change-password', (req, res) => res.redirect('/account'));
router.get('/notifications', (req, res) => res.redirect('/account'));
router.get('/privacy', (req, res) => res.redirect('/account'));
router.get('/delete', (req, res) => res.redirect('/account'));

module.exports = router;
