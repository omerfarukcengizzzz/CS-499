const request = require('request');
const apiOptions = {
    server: 'http://localhost:3000'
};

const myBookings = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    let userEmail = '';
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userEmail = payload.email;
    } catch (e) {
        return res.redirect('/login');
    }

    const requestOptions = {
        url: `${apiOptions.server}/api/bookings/user/${userEmail}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {}
    };

    request(requestOptions, (err, response, bookings) => {
        let message = null;
        let bookingsList = [];

        if (err) {
            message = 'Error loading bookings. Please try again.';
        } else if (response.statusCode === 404) {
            message = 'You have no bookings yet. Start exploring trips!';
        } else if (response.statusCode === 200) {
            bookingsList = bookings;
            if (bookingsList.length === 0) {
                message = 'You have no bookings yet. Start exploring trips!';
            }
        } else {
            message = 'Error loading bookings.';
        }

        res.render('mybookings', {
            title: 'My Bookings - Travlr Getaways',
            bookings: bookingsList,
            message: message,
            success: req.query.success
        });
    });
};

const cancelBooking = (req, res) => {
    const token = req.cookies['travlr-token'];
    
    if (!token) {
        return res.redirect('/login');
    }

    const bookingId = req.params.bookingId;

    const requestOptions = {
        url: `${apiOptions.server}/api/bookings/${bookingId}/status`,
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: {
            status: 'cancelled'
        }
    };

    request(requestOptions, (err, response, body) => {
        if (err || response.statusCode !== 200) {
            return res.redirect('/mybookings?error=cancel_failed');
        }
        
        res.redirect('/mybookings?success=cancelled');
    });
};

module.exports = {
    myBookings,
    cancelBooking
};
