const mongoose = require('mongoose');
const User = require('../models/user');

const usersList = async (req, res) => {
    try {
        const users = await User
            .find({})
            .select('-hash -salt')
            .exec();

        return res
            .status(200)
            .json(users);
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

const usersFindById = async (req, res) => {
    try {
        const user = await User
            .findById(req.params.userId)
            .select('-hash -salt')
            .exec();

        if (!user) {
            return res
                .status(404)
                .json({ message: 'User not found' });
        }

        return res
            .status(200)
            .json(user);
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

const usersDeleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId).exec();

        if (!user) {
            return res
                .status(404)
                .json({ message: 'User not found' });
        }

        return res
            .status(204)
            .send();
    } catch (err) {
        return res
            .status(500)
            .json({ error: err.message });
    }
};

module.exports = {
    usersList,
    usersFindById,
    usersDeleteUser
};
