const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/user');

// Register a new user
const register = async (req, res) => {
    // Check that required fields are provided
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ "message": "All fields required" });
    }

    // Create a new user instance
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;

    // Use the setPassword method to hash and store the password
    user.setPassword(req.body.password);

    try {
        // Save the user to the database
        await user.save();

        // Generate a JWT token for the new user
        const token = user.generateJWT();

        // Return the token to the client
        res.status(200).json({ token });
    } catch (err) {
        // Handle errors (like duplicate email)
        res.status(400).json(err);
    }
};

// Login an existing user
const login = (req, res) => {
    // Validate message to ensure that email and password are present.
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ "message": "All fields required" });
    }

    // Delegate authentication to passport module
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            // Error in Authentication Process
            return res
                .status(404)
                .json(err);
        }

        if (user) { // Auth succeeded - generate JWT and return to caller
            const token = user.generateJWT();
            res
                .status(200)
                .json({ token });
        } else { // Auth failed return error
            res
                .status(401)
                .json(info);
        }
    })(req, res);
};

// Export methods that drive endpoints.
module.exports = {
    register,
    login
};