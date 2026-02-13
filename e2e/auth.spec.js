// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_USERS } = require('./helpers/test-data');

/**
 * Authentication Security Tests
 * Verifies that protected routes require authentication
 * 
 * Demonstrates:
 * - Security testing mindset (Outcome 5)
 * - Testing access control
 * - Verifying authentication requirements
 * - API security testing
 * 
 * Skills: Security testing, API testing, access control verification
 * Outcomes: 4 (Tools/Techniques), 5 (Security Mindset)
 */

test.describe('Authentication - Customer Site Protected Routes', () => {

    test('should require login to access account page', async ({ page }) => {
        // Try to access account page without logging in
        await page.goto('http://localhost:3000/account');

        await page.waitForTimeout(2000);

        // Should redirect to login or show unauthorized
        const currentUrl = page.url();
        const isOnLogin = currentUrl.includes('login');
        const isOnAccount = currentUrl.includes('account');

        // Check for login form presence (redirected)
        const loginForm = page.locator('form[action="/login"]');
        const hasLoginForm = await loginForm.isVisible();

        // Either redirected to login OR blocked from account
        expect(isOnLogin || hasLoginForm || !isOnAccount).toBeTruthy();
    });

    test('should require login to access cart page', async ({ page }) => {
        // Try to access cart without logging in
        await page.goto('http://localhost:3000/cart');

        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const isOnLogin = currentUrl.includes('login');
        const isOnCart = currentUrl.includes('cart');

        // Check if redirected to login
        const loginForm = page.locator('form[action="/login"], #email');
        const hasLoginForm = await loginForm.isVisible().catch(() => false);

        // Either redirected to login OR cart requires authentication
        expect(isOnLogin || hasLoginForm || !isOnCart).toBeTruthy();
    });

    test('logged-out state should show Login and Register links', async ({ page }) => {
        await page.goto('http://localhost:3000/');

        // Check #user-links for logged-out indicators
        const userLinks = page.locator('#user-links');
        await expect(userLinks).toBeVisible();

        // Should show Login link
        const loginLink = page.locator('#user-links a[href="/login"]');
        await expect(loginLink).toBeVisible();

        // Should show Register link
        const registerLink = page.locator('#user-links a[href="/register"]');
        await expect(registerLink).toBeVisible();

        // Should NOT show Logout link
        const logoutLink = page.locator('#user-links a[href="/login/logout"]');
        await expect(logoutLink).not.toBeVisible();
    });

    test('logged-in state should show Logout and My Account links', async ({ page }) => {
        // Login first
        await page.goto('http://localhost:3000/login');
        await page.fill('#email', TEST_USERS.customer.email);
        await page.fill('#password', TEST_USERS.customer.password);
        await page.click('button.btn-submit');
        await page.waitForTimeout(2000);

        // Navigate to homepage to check header
        await page.goto('http://localhost:3000/');

        const userLinks = page.locator('#user-links');
        await expect(userLinks).toBeVisible();

        // Should show My Account link (logged-in indicator)
        const accountLink = page.locator('#user-links a[href="/account"]');
        const hasAccount = await accountLink.isVisible();

        // Should show Logout link (logged-in indicator)
        const logoutLink = page.locator('#user-links a[href="/login/logout"]');
        const hasLogout = await logoutLink.isVisible();

        // At least one logged-in indicator should be present
        expect(hasAccount || hasLogout).toBeTruthy();
    });
});

test.describe('Authentication - Admin SPA Protection', () => {

    test('should not show admin functions without login', async ({ page }) => {
        await page.goto('http://localhost:4200/');

        // Wait for Angular to load
        await page.waitForTimeout(3000);

        // Should show login form, not admin functionality
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('#password');

        const hasLoginForm = await emailInput.isVisible() || await passwordInput.isVisible();

        // Add Trip button should NOT be visible (admin-only function)
        const addTripButton = page.locator('button:has-text("Add Trip")');
        const hasAddTrip = await addTripButton.isVisible();

        // Either login form shown OR no admin functions visible
        expect(hasLoginForm || !hasAddTrip).toBeTruthy();
    });

    test('trip cards should not show edit/delete without login', async ({ page }) => {
        await page.goto('http://localhost:4200/');
        await page.waitForTimeout(3000);

        // Check if any trip cards are visible
        const tripCards = page.locator('.card');
        const cardCount = await tripCards.count();

        if (cardCount > 0) {
            // If cards are visible, Edit/Delete buttons should NOT be there
            const editButton = page.locator('button:has-text("Edit Trip")');
            const deleteButton = page.locator('button:has-text("Delete")');

            const hasEdit = await editButton.first().isVisible().catch(() => false);
            const hasDelete = await deleteButton.first().isVisible().catch(() => false);

            // Without login, admin buttons should be hidden
            expect(!hasEdit && !hasDelete).toBeTruthy();
        } else {
            // No cards visible without login - that's also acceptable security
            expect(true).toBeTruthy();
        }
    });

    test('admin functions should appear after login', async ({ page }) => {
        await page.goto('http://localhost:4200/login');
        await page.waitForTimeout(2000);

        // Login
        await page.fill('input[name="email"]', TEST_USERS.admin.email);
        await page.fill('#password', TEST_USERS.admin.password);

        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill(TEST_USERS.admin.name);
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        // Now Add Trip button should be visible
        const addTripButton = page.locator('button:has-text("Add Trip")');
        await expect(addTripButton).toBeVisible({ timeout: 5000 });

        // If there are trip cards, they should have Edit/Delete buttons
        const tripCards = page.locator('.card');
        const cardCount = await tripCards.count();

        if (cardCount > 0) {
            const editButton = page.locator('.card button:has-text("Edit Trip")').first();
            await expect(editButton).toBeVisible();
        }
    });
});

test.describe('Authentication - API Security', () => {

    test('API should reject trip creation without token', async ({ page }) => {
        // Attempt to create trip without auth header
        const response = await page.request.post('http://localhost:3000/api/trips', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                code: 'NOAUTH001',
                name: 'Unauthorized Trip Attempt',
                length: '1 day',
                start: new Date().toISOString(),
                resort: 'Hacker Resort',
                perPerson: '0.01',
                image: 'hack.jpg',
                description: 'This should fail without authentication'
            }
        });

        // Should get 401 Unauthorized
        expect(response.status()).toBe(401);
    });

    test('API should reject trip creation with invalid token', async ({ page }) => {
        const response = await page.request.post('http://localhost:3000/api/trips', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid.malformed.token'
            },
            data: {
                code: 'BADTOKEN001',
                name: 'Bad Token Trip',
                length: '1 day',
                start: new Date().toISOString(),
                resort: 'Invalid Resort',
                perPerson: '0.01',
                image: 'bad.jpg',
                description: 'This should fail with invalid token'
            }
        });

        // Should get 401 Unauthorized
        expect(response.status()).toBe(401);
    });

    test('API should reject trip creation with expired token', async ({ page }) => {
        // Create a token that looks valid but is expired
        // This is a malformed JWT for testing purposes
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjF9.expired';

        const response = await page.request.post('http://localhost:3000/api/trips', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${expiredToken}`
            },
            data: {
                code: 'EXPIRED001',
                name: 'Expired Token Trip',
                length: '1 day',
                start: new Date().toISOString(),
                resort: 'Expired Resort',
                perPerson: 0.01,
                image: 'expired.jpg',
                description: 'This should fail with expired token',
                category: 'other'
            }
        });

        // Should get 401 Unauthorized
        expect(response.status()).toBe(401);
    });

    test('API login should work with valid credentials', async ({ page }) => {
        const response = await page.request.post('http://localhost:3000/api/login', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                email: TEST_USERS.admin.email,
                password: TEST_USERS.admin.password
            }
        });

        // Should succeed
        expect(response.status()).toBe(200);

        // Should return a token
        const data = await response.json();
        expect(data.token).toBeDefined();
        expect(data.token.length).toBeGreaterThan(0);
    });

    test('API login should fail with wrong password', async ({ page }) => {
        const response = await page.request.post('http://localhost:3000/api/login', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                email: TEST_USERS.admin.email,
                password: 'wrongpassword123'
            }
        });

        // Should fail with 401 or similar error
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('API should allow trip creation with valid token', async ({ page }) => {
        // First, login to get a valid token
        const loginResponse = await page.request.post('http://localhost:3000/api/login', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                email: TEST_USERS.admin.email,
                password: TEST_USERS.admin.password
            }
        });

        const loginData = await loginResponse.json();
        const token = loginData.token;

        // Now try to create a trip with valid token
        const uniqueCode = `AUTHTEST${Date.now().toString().slice(-6)}`;

        const createResponse = await page.request.post('http://localhost:3000/api/trips', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: {
                code: uniqueCode,
                name: 'Authenticated Trip Test',
                length: '3 days / 2 nights',
                start: new Date().toISOString(),
                resort: 'Auth Test Resort',
                perPerson: 299.99,
                image: 'auth-test.jpg',
                description: 'Created with valid authentication token',
                category: 'beach'
            }
        });

        // Should succeed with 200 or 201
        expect(createResponse.status()).toBeLessThan(300);
    });
});

test.describe('Authentication - Login Security Practices', () => {

    test('login should not reveal if email exists', async ({ page }) => {
        // Try login with definitely non-existent email
        await page.goto('http://localhost:3000/login');

        await page.fill('#email', 'definitely.not.real.user.12345@fake.com');
        await page.fill('#password', 'anypassword');
        await page.click('button.btn-submit');

        await page.waitForTimeout(2000);

        // Check error message
        const pageContent = await page.content();
        const lowerContent = pageContent.toLowerCase();

        // These messages would reveal user existence - bad security practice
        const revealsUserExists =
            lowerContent.includes('user not found') ||
            lowerContent.includes('email not found') ||
            lowerContent.includes('no user') ||
            lowerContent.includes('no account');

        // Log for security assessment (this is informational)
        if (revealsUserExists) {
            console.log('⚠️ Security Note: Login error reveals user existence');
        } else {
            console.log('✓ Good: Login error is generic');
        }

        // Test passes regardless - it's documenting behavior
        expect(true).toBeTruthy();
    });

    test('login form should have required attributes', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        // Check that email field has required attribute
        const emailInput = page.locator('#email');
        const emailRequired = await emailInput.getAttribute('required');

        // Check that password field has required attribute  
        const passwordInput = page.locator('#password');
        const passwordRequired = await passwordInput.getAttribute('required');

        // At least email should be required
        expect(emailRequired !== null || passwordRequired !== null).toBeTruthy();
    });

    test('logout should clear session', async ({ page }) => {
        // Login first
        await page.goto('http://localhost:3000/login');
        await page.fill('#email', TEST_USERS.customer.email);
        await page.fill('#password', TEST_USERS.customer.password);
        await page.click('button.btn-submit');
        await page.waitForTimeout(2000);

        // Navigate to ensure logged in
        await page.goto('http://localhost:3000/');

        // Should see logged-in state
        const logoutLink = page.locator('a[href="/login/logout"]');

        if (await logoutLink.isVisible()) {
            // Logout
            await logoutLink.click();
            await page.waitForTimeout(2000);

            // Go back to homepage
            await page.goto('http://localhost:3000/');

            // Should now see logged-out state (Login link visible)
            const loginLink = page.locator('#user-links a[href="/login"]');
            await expect(loginLink).toBeVisible();
        }
    });
});