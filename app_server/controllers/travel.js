const Trip = require('../../app_api/models/travlr');

/* GET travel view */
const travel = async function (req, res, next) {
    const searchQuery = req.query.search || '';
    const category = req.query.category || 'all';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 6; // Trips per page for customer view
    const skip = (page - 1) * limit;

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

        // Get total count for pagination
        const total = await Trip.countDocuments(query).exec();
        const pages = Math.ceil(total / limit);

        // Execute query with text search relevance sorting if applicable
        let trips;
        if (searchQuery.trim()) {
            trips = await Trip
                .find(query, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(limit)
                .exec();
        } else {
            trips = await Trip
                .find(query)
                .skip(skip)
                .limit(limit)
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
            otherCount,
            pagination: {
                page,
                pages,
                total,
                hasPrev: page > 1,
                hasNext: page < pages
            }
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
            otherCount: 0,
            pagination: { page: 1, pages: 0, total: 0, hasPrev: false, hasNext: false }
        });
    }
};

module.exports = {
    travel
};
