const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('../models/user');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email'  // Tell passport to use email instead of username
        },
        async (username, password, done) => {
            // Find user by email
            const q = await User.findOne({ email: username }).exec();

            // Check if user exists
            if (!q) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }

            // Check if password is valid using the method from our User model
            if (!q.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }

            // Authentication successful - return the user
            return done(null, q);
        }
    )
);