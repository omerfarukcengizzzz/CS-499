const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tripCode: {
        type: String,
        required: true,
        index: true
    },
    tripName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    travelers: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    travelDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    specialRequests: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Booking = mongoose.model('bookings', bookingSchema);
module.exports = Booking;
