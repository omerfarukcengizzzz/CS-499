const apiOptions = {
    server: 'http://localhost:3000'
};

const myBookings = async (req, res) => {
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

    try {
        const response = await fetch(`${apiOptions.server}/api/bookings/user/${userEmail}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        let message = null;
        let bookingsList = [];

        if (response.status === 404) {
            message = 'You have no bookings yet. Start exploring trips!';
        } else if (response.ok) {
            bookingsList = await response.json();
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
    } catch (err) {
        res.render('mybookings', {
            title: 'My Bookings - Travlr Getaways',
            bookings: [],
            message: 'Error loading bookings. Please try again.',
            success: null
        });
    }
};

const cancelBooking = async (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const bookingId = req.params.bookingId;

    try {
        const response = await fetch(`${apiOptions.server}/api/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (!response.ok) {
            return res.redirect('/mybookings?error=cancel_failed');
        }

        res.redirect('/mybookings?success=cancelled');
    } catch (err) {
        res.redirect('/mybookings?error=cancel_failed');
    }
};

module.exports = {
    myBookings,
    cancelBooking
};
