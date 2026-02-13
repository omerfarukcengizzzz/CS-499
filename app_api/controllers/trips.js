const mongoose = require('mongoose');
const Trip = require('../models/travlr');

// GET: /trips - Returns paginated trips
const tripsList = async (req, res) => {
    try {
        // Extract query parameters
        const searchQuery = req.query.search || '';
        const category = req.query.category || 'all';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        // Build query object
        let query = {};

        // Add text search if search term provided
        if (searchQuery.trim()) {
            query.$text = { $search: searchQuery };
        }

        // Add category filter if not 'all'
        if (category !== 'all') {
            query.category = category;
        }

        // Get total count for pagination metadata
        const total = await Trip.countDocuments(query).exec();

        let results;

        // If using text search, include relevance score and sort by it
        if (searchQuery.trim()) {
            results = await Trip
                .find(query, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(limit)
                .exec();
        } else {
            // No search term - just filter by category (or return all)
            results = await Trip
                .find(query)
                .skip(skip)
                .limit(limit)
                .exec();
        }

        return res.status(200).json({
            data: results,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET: /trips/:tripCode - Returns a single trip by code
const tripsFindByCode = async (req, res) => {
    try {
        const q = await Trip
            .find({ 'code': req.params.tripCode })
            .exec();

        console.log(q);

        if (!q || q.length === 0) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        } else {
            return res
                .status(200)
                .json(q);
        }
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

// POST: /trips - Adds a new Trip
const tripsAddTrip = async (req, res) => {
    try {
        const newTrip = new Trip({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description,
            category: req.body.category
        });

        const q = await newTrip.save();

        return res
            .status(201)
            .json(q);
    } catch (err) {
        return res
            .status(400)
            .json({ error: err.message });
    }
};

// PUT: /trips/:tripCode - Updates a Trip
const tripsUpdateTrip = async (req, res) => {
    try {
        const q = await Trip.findOneAndUpdate(
            { 'code': req.params.tripCode },
            {
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description,
                category: req.body.category
            },
            { new: true }
        ).exec();

        if (!q) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        } else {
            return res
                .status(200)
                .json(q);
        }
    } catch (err) {
        return res
            .status(400)
            .json({ error: err.message });
    }
};

// DELETE: /trips/:tripCode - Deletes a Trip
const tripsDeleteTrip = async (req, res) => {
    try {
        const q = await Trip.findOneAndDelete(
            { 'code': req.params.tripCode }
        ).exec();

        if (!q) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        } else {
            return res
                .status(204)
                .send();
        }
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip,
    tripsDeleteTrip
};