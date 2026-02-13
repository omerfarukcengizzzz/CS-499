const apiOptions = {
    server: 'http://localhost:3000'
};

// GET: Display login form
const login = (req, res) => {
    res.render('login', {
        title: 'Login - Travlr Getaways',
        error: null
    });
};

// POST: Handle login submission
const loginSubmit = async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.render('login', {
            title: 'Login - Travlr Getaways',
            error: 'All fields are required'
        });
    }

    try {
        const response = await fetch(`${apiOptions.server}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const body = await response.json();

        if (response.ok && body.token) {
            // Login successful - store token in session/cookie
            res.cookie('travlr-token', body.token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
            res.redirect('/travel');
        } else {
            res.render('login', {
                title: 'Login - Travlr Getaways',
                error: 'Invalid email or password'
            });
        }
    } catch (err) {
        res.render('login', {
            title: 'Login - Travlr Getaways',
            error: 'Login failed. Please try again.'
        });
    }
};

// Logout
const logout = (req, res) => {
    res.clearCookie('travlr-token');
    res.redirect('/');
};

module.exports = {
    login,
    loginSubmit,
    logout
};
