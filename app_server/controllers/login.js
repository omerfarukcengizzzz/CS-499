const request = require('request');
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
const loginSubmit = (req, res) => {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
        return res.render('login', {
            title: 'Login - Travlr Getaways',
            error: 'All fields are required'
        });
    }
    
    // Call API to login user
    const requestOptions = {
        url: `${apiOptions.server}/api/login`,
        method: 'POST',
        json: {
            email: email,
            password: password
        }
    };
    
    request(requestOptions, (err, response, body) => {
        if (err) {
            return res.render('login', {
                title: 'Login - Travlr Getaways',
                error: 'Login failed. Please try again.'
            });
        }
        
        if (response.statusCode === 200 && body.token) {
            // Login successful - store token in session/cookie
            res.cookie('travlr-token', body.token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
            res.redirect('/travel');
        } else {
            res.render('login', {
                title: 'Login - Travlr Getaways',
                error: 'Invalid email or password'
            });
        }
    });
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
