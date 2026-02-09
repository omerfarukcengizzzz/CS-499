const request = require('request');
const apiOptions = {
    server: 'http://localhost:3000'
};

const bookingForm = async (req, res) => {
    const tripCode = req.params.tripCode;
    
    if (!tripCode) {
        return res.redirect('/travel');
    }

    const requestOptions = {
        url: `${apiOptions.server}/api/trips/${tripCode}`,
        method: 'GET',
        json: {}
    };

    request(requestOptions, (err, response, trip) => {
        if (err || response.statusCode !== 200) {
            return res.render('error', {
                message: 'Trip not found',
                error: { status: 404 }
            });
        }

        const token = req.cookies['travlr-token'];
        let userEmail = '';
        let userName = '';

        if (token) {
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                userEmail = payload.email || '';
                userName = payload.name || '';
            } catch (e) {
                console.log('Error parsing token:', e);
            }
        }

        res.render('booking', {
            title: 'Book Trip - Travlr Getaways',
            trip: trip[0],
            userEmail: userEmail,
            userName: userName,
            isLoggedIn: !!token,
            error: null,
            success: null
        });
    });
};

const bookingSubmit = async (req, res) => {
    const tripCode = req.params.tripCode;
    
    const token = req.cookies['travlr-token'];
    if (!token) {
        return res.redirect('/login');
    }

    let userEmail = '';
    let userName = '';
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userEmail = payload.email;
        userName = payload.name;
    } catch (e) {
        return res.redirect('/login');
    }

    const { travelers, travelDate, contactPhone, specialRequests } = req.body;
    
    if (!travelers || !travelDate) {
        const tripRequestOptions = {
            url: `${apiOptions.server}/api/trips/${tripCode}`,
            method: 'GET',
            json: {}
        };

        return request(tripRequestOptions, (err, response, trip) => {
            res.render('booking', {
                title: 'Book Trip - Travlr Getaways',
                trip: trip[0],
                userEmail: userEmail,
                userName: userName,
                isLoggedIn: true,
                error: 'Please fill in all required fields',
                success: null
            });
        });
    }

    const tripRequestOptions = {
        url: `${apiOptions.server}/api/trips/${tripCode}`,
        method: 'GET',
        json: {}
    };

    request(tripRequestOptions, (err, tripResponse, tripData) => {
        if (err || tripResponse.statusCode !== 200) {
            return res.render('error', {
                message: 'Trip not found',
                error: { status: 404 }
            });
        }

        const trip = tripData[0];
        const pricePerPerson = parseFloat(trip.perPerson);
        const totalPrice = pricePerPerson * parseInt(travelers);

        const bookingData = {
            tripCode: tripCode,
            tripName: trip.name,
            userEmail: userEmail,
            userName: userName,
            travelers: parseInt(travelers),
            totalPrice: totalPrice,
            travelDate: travelDate,
            contactPhone: contactPhone || '',
            specialRequests: specialRequests || '',
            status: 'pending'
        };

        const bookingRequestOptions = {
            url: `${apiOptions.server}/api/bookings`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            json: bookingData
        };

        request(bookingRequestOptions, (bookingErr, bookingResponse, bookingBody) => {
            if (bookingErr || bookingResponse.statusCode !== 201) {
                return res.render('booking', {
                    title: 'Book Trip - Travlr Getaways',
                    trip: trip,
                    userEmail: userEmail,
                    userName: userName,
                    isLoggedIn: true,
                    error: 'Booking failed. Please try again.',
                    success: null
                });
            }

            res.render('booking', {
                title: 'Book Trip - Travlr Getaways',
                trip: trip,
                userEmail: userEmail,
                userName: userName,
                isLoggedIn: true,
                error: null,
                success: 'Booking successful! Your booking ID is: ' + bookingBody._id,
                bookingId: bookingBody._id
            });
        });
    });
};

module.exports = {
    bookingForm,
    bookingSubmit
};
