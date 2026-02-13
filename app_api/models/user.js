const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    hash: String,
    salt: String
});

// Method to set password for the user record
userSchema.methods.setPassword = function (password) {
    // Create a random 16-byte salt for this user
    this.salt = crypto.randomBytes(16).toString('hex');

    // Hash the password using the salt (600000 iterations, 64-byte key, sha512 algorithm)
    this.hash = crypto.pbkdf2Sync(password, this.salt, 600000, 64, 'sha512').toString('hex');
};

// Method to verify that the password submitted matches the stored password
userSchema.methods.validPassword = function (password) {
    // Hash the submitted password with the stored salt
    const hash = crypto.pbkdf2Sync(password, this.salt, 600000, 64, 'sha512').toString('hex');

    // Return true if the hashes match, false otherwise
    return this.hash === hash;
};

// Method to generate a JSON Web Token for the specific user record
userSchema.methods.generateJWT = function () {
    return jwt.sign({
        // Payload for our JSON Web Token
        _id: this._id,
        email: this.email,
        name: this.name,
        role: this.role  // Include role for authorization checks
    },
        process.env.JWT_SECRET,  // SECRET stored in .env file
        { expiresIn: '1h' });    // Token expires an hour from creation
};

// Create the User model and export it
const User = mongoose.model('users', userSchema);
module.exports = User;