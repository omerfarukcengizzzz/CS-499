// var fs = require('fs');
// var trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

// const travel = (req, res) => {
//     res.render('travel', { title: "Travlr Getaways", trips });
// };

/* GET travel view */
const tripsEndpoint = 'http://localhost:3000/api/trips';

const options = {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
}

const travel = async function (req, res, next) {
    const searchQuery = req.query.search || '';
    const category = req.query.category || 'all';

    try {
        // First, get all trips to calculate category counts
        const allTripsResponse = await fetch(tripsEndpoint, options);
        const allTrips = await allTripsResponse.json();

        // Calculate category counts from all trips
        let beachCount = 0;
        let cruiseCount = 0;
        let mountainCount = 0;
        let otherCount = 0;

        if (allTrips instanceof Array) {
            allTrips.forEach(trip => {
                if (trip.category === 'beach') beachCount++;
                else if (trip.category === 'cruise') cruiseCount++;
                else if (trip.category === 'mountain') mountainCount++;
                else if (trip.category === 'other') otherCount++;
            });
        }

        // Build API URL with query parameters for filtered results
        const params = new URLSearchParams();
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        if (category !== 'all') {
            params.append('category', category);
        }

        const apiUrl = params.toString()
            ? `${tripsEndpoint}?${params.toString()}`
            : tripsEndpoint;

        const response = await fetch(apiUrl, options);
        const json = await response.json();
        let trips = json;

        let message = null;
        if (!(trips instanceof Array)) {
            message = 'API lookup error';
            trips = [];
        } else if (!trips.length) {
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