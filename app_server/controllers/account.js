const apiOptions = {
    server: 'http://localhost:3000'
};

function getUserFromToken(token) {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return {
            email: payload.email,
            name: payload.name,
            _id: payload._id
        };
    } catch (e) {
        return null;
    }
}

const accountPage = async (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    let bookingStats = {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0
    };

    try {
        const response = await fetch(`${apiOptions.server}/api/bookings/user/${user.email}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const bookings = await response.json();
            bookingStats.total = bookings.length;
            bookingStats.pending = bookings.filter(b => b.status === 'pending').length;
            bookingStats.confirmed = bookings.filter(b => b.status === 'confirmed').length;
            bookingStats.completed = bookings.filter(b => b.status === 'completed').length;
            bookingStats.cancelled = bookings.filter(b => b.status === 'cancelled').length;
            bookingStats.totalSpent = bookings
                .filter(b => b.status !== 'cancelled')
                .reduce((sum, b) => sum + b.totalPrice, 0);
        }
    } catch (err) {
        // Leave stats at defaults
    }

    res.render('account', {
        title: 'My Account - Travlr Getaways',
        user: user,
        bookingStats: bookingStats,
        success: req.query.success,
        error: req.query.error
    });
};

const updateProfile = (req, res) => {
    const token = req.cookies['travlr-token'];

    if (!token) {
        return res.redirect('/login');
    }

    const user = getUserFromToken(token);
    if (!user) {
        return res.redirect('/login');
    }

    res.redirect('/account?success=profile_updated');
};

module.exports = {
    accountPage,
    updateProfile
};
