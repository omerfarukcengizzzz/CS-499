const apiOptions = {
    server: 'http://localhost:3000'
};

// GET: Display registration form
const register = (req, res) => {
    res.render('register', {
        title: 'Register - Travlr Getaways',
        error: null,
        success: null
    });
};

// POST: Handle registration submission
const registerSubmit = async (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
        return res.render('register', {
            title: 'Register - Travlr Getaways',
            error: 'All fields are required',
            success: null
        });
    }

    if (password !== passwordConfirm) {
        return res.render('register', {
            title: 'Register - Travlr Getaways',
            error: 'Passwords do not match',
            success: null
        });
    }

    if (password.length < 8) {
        return res.render('register', {
            title: 'Register - Travlr Getaways',
            error: 'Password must be at least 8 characters',
            success: null
        });
    }

    try {
        // Call API to register user using built-in fetch
        const response = await fetch(`${apiOptions.server}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const body = await response.json();

        if (response.ok) {
            res.render('register', {
                title: 'Register - Travlr Getaways',
                error: null,
                success: 'Registration successful! You can now login.'
            });
        } else {
            res.render('register', {
                title: 'Register - Travlr Getaways',
                error: body.message || 'Registration failed. Email may already be in use.',
                success: null
            });
        }
    } catch (err) {
        res.render('register', {
            title: 'Register - Travlr Getaways',
            error: 'Registration failed. Please try again.',
            success: null
        });
    }
};

module.exports = {
    register,
    registerSubmit
};

