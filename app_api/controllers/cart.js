const mongoose = require('mongoose');
const Cart = require('../models/cart');

// Helper: check if user owns the resource or is admin
const isOwnerOrAdmin = (req, ownerEmail) => {
    return req.auth.email === ownerEmail || req.auth.role === 'admin';
};

// Middleware-style ownership check used at the top of each cart function
const checkCartOwnership = (req, res) => {
    if (!isOwnerOrAdmin(req, req.params.email)) {
        res.status(403).json({ message: 'Access denied: you can only access your own cart' });
        return false;
    }
    return true;
};

const getCart = async (req, res) => {
    if (!checkCartOwnership(req, res)) return;
    try {
        let cart = await Cart.findOne({ userEmail: req.params.email }).exec();

        if (!cart) {
            cart = new Cart({
                userEmail: req.params.email,
                items: [],
                totalPrice: 0,
                itemCount: 0
            });
            await cart.save();
        }

        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const addToCart = async (req, res) => {
    if (!checkCartOwnership(req, res)) return;
    try {
        const { tripCode, tripName, tripImage, resort, length, pricePerPerson, travelers, travelDate } = req.body;

        if (!tripCode || !tripName || !pricePerPerson || !travelers || !travelDate) {
            return res.status(400).json({
                message: 'Missing required fields: tripCode, tripName, pricePerPerson, travelers, travelDate'
            });
        }

        const subtotal = parseFloat(pricePerPerson) * parseInt(travelers);

        let cart = await Cart.findOne({ userEmail: req.params.email }).exec();

        if (!cart) {
            cart = new Cart({
                userEmail: req.params.email,
                items: []
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.tripCode === tripCode);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].travelers = parseInt(travelers);
            cart.items[existingItemIndex].travelDate = travelDate;
            cart.items[existingItemIndex].subtotal = subtotal;
        } else {
            cart.items.push({
                tripCode,
                tripName,
                tripImage: tripImage || 'default.jpg',
                resort: resort || '',
                length: length || '',
                pricePerPerson: parseFloat(pricePerPerson),
                travelers: parseInt(travelers),
                travelDate,
                subtotal
            });
        }

        cart.calculateTotals();
        await cart.save();

        return res.status(200).json(cart);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const updateCartItem = async (req, res) => {
    if (!checkCartOwnership(req, res)) return;
    try {
        const { travelers, travelDate } = req.body;

        let cart = await Cart.findOne({ userEmail: req.params.email }).exec();

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.tripCode === req.params.tripCode);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (travelers) {
            item.travelers = parseInt(travelers);
            item.subtotal = item.pricePerPerson * parseInt(travelers);
        }
        if (travelDate) {
            item.travelDate = travelDate;
        }

        cart.calculateTotals();
        await cart.save();

        return res.status(200).json(cart);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const removeFromCart = async (req, res) => {
    if (!checkCartOwnership(req, res)) return;
    try {
        let cart = await Cart.findOne({ userEmail: req.params.email }).exec();

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.tripCode !== req.params.tripCode);
        cart.calculateTotals();
        await cart.save();

        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const clearCart = async (req, res) => {
    if (!checkCartOwnership(req, res)) return;
    try {
        let cart = await Cart.findOne({ userEmail: req.params.email }).exec();

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.calculateTotals();
        await cart.save();

        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const checkoutCart = async (req, res) => {
    if (!checkCartOwnership(req, res)) return;
    try {
        const Booking = require('../models/booking');

        let cart = await Cart.findOne({ userEmail: req.params.email }).exec();

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const { userName, contactPhone, specialRequests } = req.body;

        const bookingPromises = cart.items.map(item => {
            const booking = new Booking({
                tripCode: item.tripCode,
                tripName: item.tripName,
                userEmail: req.params.email,
                userName: userName || '',
                travelers: item.travelers,
                totalPrice: item.subtotal,
                travelDate: item.travelDate,
                contactPhone: contactPhone || '',
                specialRequests: specialRequests || '',
                status: 'pending'
            });
            return booking.save();
        });

        const bookings = await Promise.all(bookingPromises);

        cart.items = [];
        cart.calculateTotals();
        await cart.save();

        return res.status(201).json({
            message: 'Checkout successful',
            bookings: bookings,
            bookingCount: bookings.length
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkoutCart
};
