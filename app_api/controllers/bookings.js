const mongoose = require('mongoose');
const Booking = require('../models/booking');

// Helper: check if user owns the resource or is admin
const isOwnerOrAdmin = (req, ownerEmail) => {
    return req.auth.email === ownerEmail || req.auth.role === 'admin';
};

const bookingsList = async (req, res) => {
    try {
        // Admin sees all bookings, regular users see only their own
        const filter = req.auth.role === 'admin' ? {} : { userEmail: req.auth.email };

        const bookings = await Booking
            .find(filter)
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
        // Users can only view their own bookings
        if (!isOwnerOrAdmin(req, req.params.email)) {
            return res.status(403).json({ message: 'Access denied: you can only view your own bookings' });
        }

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

        // Users can only view their own bookings
        if (!isOwnerOrAdmin(req, booking.userEmail)) {
            return res.status(403).json({ message: 'Access denied: you can only view your own bookings' });
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
        // First fetch to check ownership
        const booking = await Booking.findById(req.params.bookingId).exec();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!isOwnerOrAdmin(req, booking.userEmail)) {
            return res.status(403).json({ message: 'Access denied: you can only update your own bookings' });
        }

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
        // First fetch to check ownership
        const booking = await Booking.findById(req.params.bookingId).exec();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!isOwnerOrAdmin(req, booking.userEmail)) {
            return res.status(403).json({ message: 'Access denied: you can only delete your own bookings' });
        }

        await Booking.findByIdAndDelete(req.params.bookingId).exec();

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

        // First fetch to check ownership
        const booking = await Booking.findById(req.params.bookingId).exec();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!isOwnerOrAdmin(req, booking.userEmail)) {
            return res.status(403).json({ message: 'Access denied: you can only update your own bookings' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { status: req.body.status },
            { new: true }
        ).exec();

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
