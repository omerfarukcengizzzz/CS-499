const Trip = require('../../app_api/models/travlr');

/* GET travel view */
const travel = async function (req, res, next) {
    const searchQuery = req.query.search || '';
    const category = req.query.category || 'all';

    try {
        // Calculate category counts directly from DB
        const [beachCount, cruiseCount, mountainCount, otherCount] = await Promise.all([
            Trip.countDocuments({ category: 'beach' }),
            Trip.countDocuments({ category: 'cruise' }),
            Trip.countDocuments({ category: 'mountain' }),
            Trip.countDocuments({ category: 'other' })
        ]);

        // Build query object (mirrors app_api/controllers/trips.js logic)
        let query = {};

        if (searchQuery.trim()) {
            query.$text = { $search: searchQuery };
        }

        if (category !== 'all') {
            query.category = category;
        }

        // Execute query with text search relevance sorting if applicable
        let trips;
        if (searchQuery.trim()) {
            trips = await Trip
                .find(query, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .exec();
        } else {
            trips = await Trip
                .find(query)
                .exec();
        }

        let message = null;
        if (!trips.length) {
            message = 'No trips found';
        }

        res.render('travel', {
            title: 'Travlr Getaways',
            trips,
            searchQuery,
            category,
            message,
            beachCount,
            cruiseCount,
            mountainCount,
            otherCount
        });
    } catch (err) {
        res.render('travel', {
            title: 'Travlr Getaways',
            trips: [],
            searchQuery,
            category,
            message: 'Error loading trips',
            beachCount: 0,
            cruiseCount: 0,
            mountainCount: 0,
            otherCount: 0
        });
    }
};

module.exports = {
    travel
};