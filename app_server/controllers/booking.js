const apiOptions = {
    server: 'http://localhost:3000'
};

const bookingForm = async (req, res) => {
    const tripCode = req.params.tripCode;

    if (!tripCode) {
        return res.redirect('/travel');
    }

    try {
        const response = await fetch(`${apiOptions.server}/api/trips/${tripCode}`);

        if (!response.ok) {
            return res.render('error', {
                message: 'Trip not found',
                error: { status: 404 }
            });
        }

        const trip = await response.json();

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
    } catch (err) {
        res.render('error', {
            message: 'Error loading trip',
            error: { status: 500 }
        });
    }
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

    // Fetch the trip details first
    let trip;
    try {
        const tripResponse = await fetch(`${apiOptions.server}/api/trips/${tripCode}`);
        const tripData = await tripResponse.json();
        trip = tripData[0];
    } catch (err) {
        return res.render('error', {
            message: 'Trip not found',
            error: { status: 404 }
        });
    }

    if (!travelers || !travelDate) {
        return res.render('booking', {
            title: 'Book Trip - Travlr Getaways',
            trip: trip,
            userEmail: userEmail,
            userName: userName,
            isLoggedIn: true,
            error: 'Please fill in all required fields',
            success: null
        });
    }

    const pricePerPerson = typeof trip.perPerson === 'number' ? trip.perPerson : parseFloat(trip.perPerson);
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

    try {
        const bookingResponse = await fetch(`${apiOptions.server}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!bookingResponse.ok) {
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

        const bookingBody = await bookingResponse.json();

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
    } catch (err) {
        res.render('booking', {
            title: 'Book Trip - Travlr Getaways',
            trip: trip,
            userEmail: userEmail,
            userName: userName,
            isLoggedIn: true,
            error: 'Booking failed. Please try again.',
            success: null
        });
    }
};

module.exports = {
    bookingForm,
    bookingSubmit
};
