/**
 * Test data and API helpers for Playwright E2E tests
 * Handles user registration, login, and trip creation via API
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * Test user credentials
 * These will be created before tests run
 */
const TEST_USERS = {
    customer: {
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        password: 'TestPass123!'
    },
    admin: {
        name: 'Test Admin',
        email: 'testadmin@example.com',
        password: 'AdminPass123!'
    }
};

/**
 * Sample trip data for testing
 */
const TEST_TRIP = {
    code: 'TEST001',
    name: 'Test Trip to Paradise',
    length: '7 days / 6 nights',
    start: new Date().toISOString(),
    resort: 'Paradise Resort',
    perPerson: 999.99,
    image: 'test-trip.jpg',
    description: 'A wonderful test trip for E2E testing purposes.',
    category: 'beach'
};

/**
 * Register a new user via API
 * @param {object} user - User object with name, email, password
 * @returns {Promise<object>} - Response data
 */
async function registerUser(user) {
    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return response.json();
}

/**
 * Login and get JWT token
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<string>} - JWT token
 */
async function loginAndGetToken(email, password) {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return data.token;
}

/**
 * Create a trip via API (requires auth token)
 * @param {string} token - JWT token
 * @param {object} tripData - Trip data
 * @returns {Promise<object>} - Created trip
 */
async function createTrip(token, tripData) {
    const response = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tripData)
    });
    return response.json();
}

/**
 * Setup test data before tests run
 * Creates test users and a sample trip
 */
async function setupTestData() {
    try {
        // Register test users (ignore errors if they already exist)
        await registerUser(TEST_USERS.customer).catch(() => { });
        await registerUser(TEST_USERS.admin).catch(() => { });

        // Get admin token and create a test trip
        const token = await loginAndGetToken(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await createTrip(token, TEST_TRIP).catch(() => { });

        console.log('✓ Test data setup complete');
    } catch (error) {
        console.error('Warning: Test data setup had issues:', error.message);
    }
}

module.exports = {
    TEST_USERS,
    TEST_TRIP,
    API_BASE,
    registerUser,
    loginAndGetToken,
    createTrip,
    setupTestData
};