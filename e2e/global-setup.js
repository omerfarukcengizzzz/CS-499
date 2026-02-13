/**
 * Global setup runs once before all tests
 * Creates test users and seed data
 */
const { setupTestData } = require('./helpers/test-data');

module.exports = async function globalSetup() {
    console.log('\n🚀 Setting up test data...');
    await setupTestData();

    // Promote test admin user to admin role via direct DB call
    try {
        require('dotenv').config();
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/travlr');
        const User = require('../app_api/models/user');
        await User.updateOne(
            { email: 'testadmin@example.com' },
            { $set: { role: 'admin' } }
        );
        console.log('✓ Test admin promoted to admin role');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Warning: Could not promote test admin:', err.message);
    }

    console.log('✓ Global setup complete\n');
};