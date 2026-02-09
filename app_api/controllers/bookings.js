const mongoose = require('mongoose');
const Booking = require('../models/booking');

const bookingsList = async (req, res) => {
    try {
        const bookings = await Booking
            .find({})
            .sort({ bookingDate: -1 })
            .exec();

        return res
            .status(200)
            .json(bookings);
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

const bookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking
            .find({ userEmail: req.params.email })
            .sort({ bookingDate: -1 })
            .exec();

        if (!bookings || bookings.length === 0) {
            return res
                .status(200)
                .json({ message: 'No bookings found for this user' });
        }

        return res
            .status(200)
            .json(bookings);
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

const bookingsFindById = async (req, res) => {
    try {
        const booking = await Booking
            .findById(req.params.bookingId)
            .exec();

        if (!booking) {
            return res
                .status(404)
                .json({ message: 'Booking not found' });
        }

        return res
            .status(200)
            .json(booking);
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

const bookingsAddBooking = async (req, res) => {
    try {
        if (!req.body.tripCode || !req.body.userEmail || !req.body.travelers || !req.body.travelDate) {
            return res
                .status(400)
                .json({ message: 'Missing required fields: tripCode, userEmail, travelers, travelDate' });
        }

        const newBooking = new Booking({
            tripCode: req.body.tripCode,
            tripName: req.body.tripName,
            userEmail: req.body.userEmail,
            userName: req.body.userName,
            travelers: req.body.travelers,
            totalPrice: req.body.totalPrice,
            travelDate: req.body.travelDate,
            status: req.body.status || 'pending',
            specialRequests: req.body.specialRequests || '',
            contactPhone: req.body.contactPhone || ''
        });

        const savedBooking = await newBooking.save();

        return res
            .status(201)
            .json(savedBooking);
    } catch (err) {
        return res
            .status(400)
            .json({ error: err.message });
    }
};

const bookingsUpdateBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            {
                travelers: req.body.travelers,
                totalPrice: req.body.totalPrice,
                travelDate: req.body.travelDate,
                status: req.body.status,
                specialRequests: req.body.specialRequests,
                contactPhone: req.body.contactPhone
            },
            { new: true }
        ).exec();

        if (!updatedBooking) {
            return res
                .status(404)
                .json({ message: 'Booking not found' });
        }

        return res
            .status(200)
            .json(updatedBooking);
    } catch (err) {
        return res
            .status(400)
            .json({ error: err.message });
    }
};

const bookingsDeleteBooking = async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.bookingId).exec();

        if (!deletedBooking) {
            return res
                .status(404)
                .json({ message: 'Booking not found' });
        }

        return res
            .status(204)
            .send();
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

const bookingsUpdateStatus = async (req, res) => {
    try {
        if (!req.body.status) {
            return res
                .status(400)
                .json({ message: 'Status is required' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { status: req.body.status },
            { new: true }
        ).exec();

        if (!updatedBooking) {
            return res
                .status(404)
                .json({ message: 'Booking not found' });
        }

        return res
            .status(200)
            .json(updatedBooking);
    } catch (err) {
        return res
            .status(400)
            .json({ error: err.message });
    }
};

module.exports = {
    bookingsList,
    bookingsByUser,
    bookingsFindById,
    bookingsAddBooking,
    bookingsUpdateBooking,
    bookingsDeleteBooking,
    bookingsUpdateStatus
};
