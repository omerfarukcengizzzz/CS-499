const express = require('express');
const router = express.Router();
const controller = require('../controllers/checkout');

router.get('/', controller.checkoutForm);
router.post('/', controller.processCheckout);

module.exports = router;
