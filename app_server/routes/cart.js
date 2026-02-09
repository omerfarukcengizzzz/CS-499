const express = require('express');
const router = express.Router();
const controller = require('../controllers/cart');

router.get('/', controller.viewCart);
router.post('/add', controller.addToCart);
router.post('/remove/:tripCode', controller.removeFromCart);
router.post('/update/:tripCode', controller.updateCartItem);
router.post('/clear', controller.clearCart);

module.exports = router;
