/**
 * Global setup runs once before all tests
 * Creates test users and seed data
 */
const { setupTestData } = require('./helpers/test-data');

module.exports = async function globalSetup() {
    console.log('\n🚀 Setting up test data...');
    await setupTestData();
    console.log('✓ Global setup complete\n');
};