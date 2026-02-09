const express = require('express');
const router = express.Router();
const controller = require('../controllers/mybookings');

router.get('/', controller.myBookings);
router.post('/cancel/:bookingId', controller.cancelBooking);

module.exports = router;
