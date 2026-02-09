const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking');

router.get('/:tripCode', controller.bookingForm);
router.post('/:tripCode', controller.bookingSubmit);

module.exports = router;
