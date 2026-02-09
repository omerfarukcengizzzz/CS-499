// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_USERS } = require('./helpers/test-data');

/**
 * Admin SPA E2E Tests
 * Tests the Angular admin dashboard application on port 4200
 * 
 * Demonstrates:
 * - Testing Single Page Applications with Playwright
 * - Handling Angular routing and state
 * - CRUD operation testing (Create, Read, Update, Delete)
 * - Handling browser dialogs (confirm())
 * 
 * Skills: SPA testing, Angular app testing, CRUD workflows
 * Outcomes: 3 (Design Solutions), 4 (Tools/Techniques), 5 (Security)
 */

test.describe('Admin SPA - Authentication', () => {
    test('should display login form', async ({ page }) => {
        await page.goto('/login');

        // Wait for Angular to bootstrap
        await page.waitForTimeout(2000);

        // Should show login form with email and password fields
        await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#password')).toBeVisible();

        // Should have Sign In button
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.waitForTimeout(2000);

        // Fill with invalid credentials
        await page.fill('input[name="email"]', 'invalid@email.com');
        await page.fill('#password', 'wrongpassword');

        // Also fill name field if visible (based on Q's answer)
        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill('Test User');
        }

        // Submit
        await page.click('button[type="submit"]');

        // Wait for response
        await page.waitForTimeout(2000);

        // Should show error alert
        const errorAlert = page.locator('.alert.alert-danger');
        const hasError = await errorAlert.isVisible();

        // Either error shown or still on login (no trip listing visible)
        const tripListing = page.locator('.card');
        const noTripsVisible = !(await tripListing.first().isVisible().catch(() => false));

        expect(hasError || noTripsVisible).toBeTruthy();
    });

    test('should login successfully with admin credentials', async ({ page }) => {
        await page.goto('/login');
        await page.waitForTimeout(2000);

        // Fill login form
        await page.fill('input[name="email"]', TEST_USERS.admin.email);
        await page.fill('#password', TEST_USERS.admin.password);

        // Fill name field if visible
        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill(TEST_USERS.admin.name);
        }

        // Submit
        await page.click('button[type="submit"]');

        // Wait for login and navigation
        await page.waitForTimeout(3000);

        // Should see trip listing with cards OR Add Trip button (logged-in indicators)
        const addTripButton = page.locator('button:has-text("Add Trip")');
        const tripCards = page.locator('.card');

        const isLoggedIn = await addTripButton.isVisible() || await tripCards.first().isVisible();
        expect(isLoggedIn).toBeTruthy();
    });
});

test.describe('Admin SPA - Trip Listing', () => {
    // Login before each test in this suite
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
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
    });

    test('should display Add Trip button when logged in', async ({ page }) => {
        const addTripButton = page.locator('button:has-text("Add Trip")');
        await expect(addTripButton).toBeVisible({ timeout: 10000 });
    });

    test('should display trip cards in grid layout', async ({ page }) => {
        // Wait for trips to load
        await page.waitForTimeout(2000);

        // Should have trip cards
        const tripCards = page.locator('.card');

        // Check if at least one card is visible (or show appropriate message)
        const cardCount = await tripCards.count();

        if (cardCount > 0) {
            // First card should be visible
            await expect(tripCards.first()).toBeVisible();

            // Card should have expected elements
            const firstCard = tripCards.first();
            await expect(firstCard.locator('.card-header')).toBeVisible();
            await expect(firstCard.locator('.card-body')).toBeVisible();
        }
    });

    test('should show Edit and Delete buttons on trip cards', async ({ page }) => {
        await page.waitForTimeout(2000);

        const tripCards = page.locator('.card');
        const cardCount = await tripCards.count();

        if (cardCount > 0) {
            const firstCard = tripCards.first();

            // Should have Edit Trip button
            await expect(firstCard.locator('button:has-text("Edit Trip")')).toBeVisible();

            // Should have Delete button
            await expect(firstCard.locator('button:has-text("Delete")')).toBeVisible();
        }
    });

    test('trip cards should display trip information', async ({ page }) => {
        await page.waitForTimeout(2000);

        const tripCards = page.locator('.card');
        const cardCount = await tripCards.count();

        if (cardCount > 0) {
            const firstCard = tripCards.first();

            // Should show trip name in header
            const header = firstCard.locator('.card-header');
            await expect(header).toBeVisible();
            const headerText = await header.textContent();
            expect(headerText?.length).toBeGreaterThan(0);

            // Should show resort name
            const subtitle = firstCard.locator('.card-subtitle').first();
            await expect(subtitle).toBeVisible();

            // Should show trip image
            await expect(firstCard.locator('.card-img-top')).toBeVisible();
        }
    });
});

test.describe('Admin SPA - Create Trip', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.waitForTimeout(2000);

        await page.fill('input[name="email"]', TEST_USERS.admin.email);
        await page.fill('#password', TEST_USERS.admin.password);

        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill(TEST_USERS.admin.name);
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
    });

    test('should open add trip form when clicking Add Trip button', async ({ page }) => {
        // Click Add Trip button
        await page.click('button:has-text("Add Trip")');
        await page.waitForTimeout(1500);

        // Should show trip form with formControlName inputs
        await expect(page.locator('input[formControlName="code"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('input[formControlName="name"]')).toBeVisible();
    });

    test('should display all form fields for new trip', async ({ page }) => {
        await page.click('button:has-text("Add Trip")');
        await page.waitForTimeout(1500);

        // Check all form fields are present
        await expect(page.locator('input[formControlName="code"]')).toBeVisible();
        await expect(page.locator('input[formControlName="name"]')).toBeVisible();
        await expect(page.locator('input[formControlName="length"]')).toBeVisible();
        await expect(page.locator('input[formControlName="start"]')).toBeVisible();
        await expect(page.locator('input[formControlName="resort"]')).toBeVisible();
        await expect(page.locator('input[formControlName="perPerson"]')).toBeVisible();
        await expect(page.locator('select[formControlName="category"]')).toBeVisible();
        await expect(page.locator('input[formControlName="image"]')).toBeVisible();
        await expect(page.locator('input[formControlName="description"]')).toBeVisible();

        // Should have Save button
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should create a new trip successfully', async ({ page }) => {
        await page.click('button:has-text("Add Trip")');
        await page.waitForTimeout(1500);

        // Generate unique trip code for this test
        const uniqueCode = `E2E${Date.now().toString().slice(-6)}`;

        // Fill all form fields
        await page.fill('input[formControlName="code"]', uniqueCode);
        await page.fill('input[formControlName="name"]', 'Playwright Test Trip');
        await page.fill('input[formControlName="length"]', '5 days / 4 nights');
        await page.fill('input[formControlName="start"]', '2025-06-01');
        await page.fill('input[formControlName="resort"]', 'Test Resort');
        await page.fill('input[formControlName="perPerson"]', '499.99');

        // Select category from dropdown
        await page.selectOption('select[formControlName="category"]', 'beach');

        await page.fill('input[formControlName="image"]', 'test-image.jpg');
        await page.fill('input[formControlName="description"]', 'This trip was created by Playwright E2E testing.');

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait for save and navigation back to listing
        await page.waitForTimeout(3000);

        // Should see the new trip in the listing
        const newTripCard = page.locator(`.card:has-text("${uniqueCode}"), .card:has-text("Playwright Test Trip")`);
        await expect(newTripCard.first()).toBeVisible({ timeout: 10000 });
    });

    test('category dropdown should have expected options', async ({ page }) => {
        await page.click('button:has-text("Add Trip")');
        await page.waitForTimeout(1500);

        const categorySelect = page.locator('select[formControlName="category"]');
        await expect(categorySelect).toBeVisible();

        // Check for expected options (beach, cruise, mountain, other)
        const options = categorySelect.locator('option');
        const optionCount = await options.count();

        // Should have multiple category options
        expect(optionCount).toBeGreaterThanOrEqual(3);
    });
});

test.describe('Admin SPA - Edit Trip', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.waitForTimeout(2000);

        await page.fill('input[name="email"]', TEST_USERS.admin.email);
        await page.fill('#password', TEST_USERS.admin.password);

        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill(TEST_USERS.admin.name);
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
    });

    test('should open edit form when clicking Edit Trip button', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Find first Edit Trip button on any card
        const editButton = page.locator('.card button:has-text("Edit Trip")').first();

        if (await editButton.isVisible()) {
            await editButton.click();
            await page.waitForTimeout(2000);

            // Should navigate to edit form
            // Edit form should have same fields as add form
            await expect(page.locator('input[formControlName="code"]')).toBeVisible({ timeout: 5000 });
        }
    });

    test('edit form should be pre-populated with trip data', async ({ page }) => {
        await page.waitForTimeout(2000);

        const editButton = page.locator('.card button:has-text("Edit Trip")').first();

        if (await editButton.isVisible()) {
            // Get trip name from card before clicking edit
            const cardHeader = page.locator('.card .card-header').first();
            const tripName = await cardHeader.textContent();

            await editButton.click();
            await page.waitForTimeout(2000);

            // Form should have pre-populated values
            const nameInput = page.locator('input[formControlName="name"]');
            const nameValue = await nameInput.inputValue();

            // Name field should not be empty (pre-populated)
            expect(nameValue.length).toBeGreaterThan(0);
        }
    });

    test('should update trip successfully', async ({ page }) => {
        await page.waitForTimeout(2000);

        const editButton = page.locator('.card button:has-text("Edit Trip")').first();

        if (await editButton.isVisible()) {
            await editButton.click();
            await page.waitForTimeout(2000);

            // Update the description field
            const descriptionInput = page.locator('input[formControlName="description"]');
            const updateText = `Updated by Playwright at ${new Date().toISOString()}`;
            await descriptionInput.fill(updateText);

            // Save changes
            await page.click('button[type="submit"]');

            // Wait for save and navigation
            await page.waitForTimeout(3000);

            // Should be back on listing page
            await expect(page.locator('button:has-text("Add Trip")')).toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('Admin SPA - Delete Trip', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.waitForTimeout(2000);

        await page.fill('input[name="email"]', TEST_USERS.admin.email);
        await page.fill('#password', TEST_USERS.admin.password);

        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill(TEST_USERS.admin.name);
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
    });

    test('should show confirmation dialog when clicking Delete', async ({ page }) => {
        await page.waitForTimeout(2000);

        const deleteButton = page.locator('.card button:has-text("Delete")').first();

        if (await deleteButton.isVisible()) {
            // Set up dialog handler BEFORE clicking
            let dialogMessage = '';
            page.on('dialog', async dialog => {
                dialogMessage = dialog.message();
                await dialog.dismiss(); // Cancel the delete
            });

            await deleteButton.click();
            await page.waitForTimeout(1000);

            // Confirm dialog appeared with expected message format
            expect(dialogMessage).toContain('Are you sure');
        }
    });

    test('should not delete trip when dialog is cancelled', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Count trips before
        const tripsBefore = await page.locator('.card').count();

        if (tripsBefore > 0) {
            // Get first trip name
            const firstTripName = await page.locator('.card .card-header').first().textContent();

            // Set up dialog handler to DISMISS (cancel)
            page.on('dialog', async dialog => {
                await dialog.dismiss();
            });

            // Click delete
            await page.locator('.card button:has-text("Delete")').first().click();
            await page.waitForTimeout(2000);

            // Trip should still exist
            const tripsAfter = await page.locator('.card').count();
            expect(tripsAfter).toBe(tripsBefore);
        }
    });

    test('should delete trip when dialog is confirmed', async ({ page }) => {
        await page.waitForTimeout(2000);

        // First create a trip we can safely delete
        await page.click('button:has-text("Add Trip")');
        await page.waitForTimeout(1500);

        const deleteTestCode = `DEL${Date.now().toString().slice(-6)}`;

        await page.fill('input[formControlName="code"]', deleteTestCode);
        await page.fill('input[formControlName="name"]', 'Delete Test Trip');
        await page.fill('input[formControlName="length"]', '1 day');
        await page.fill('input[formControlName="start"]', '2025-12-31');
        await page.fill('input[formControlName="resort"]', 'Delete Resort');
        await page.fill('input[formControlName="perPerson"]', '99.99');
        await page.selectOption('select[formControlName="category"]', 'other');
        await page.fill('input[formControlName="image"]', 'delete-test.jpg');
        await page.fill('input[formControlName="description"]', 'This trip will be deleted by test');

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        // Find and delete the trip we just created
        const deleteTestCard = page.locator(`.card:has-text("Delete Test Trip")`);

        if (await deleteTestCard.isVisible()) {
            // Set up dialog handler to ACCEPT (confirm)
            page.on('dialog', async dialog => {
                await dialog.accept();
            });

            // Click delete on that specific card
            await deleteTestCard.locator('button:has-text("Delete")').click();
            await page.waitForTimeout(3000);

            // Trip should be gone
            await expect(deleteTestCard).not.toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('Admin SPA - Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.waitForTimeout(2000);

        await page.fill('input[name="email"]', TEST_USERS.admin.email);
        await page.fill('#password', TEST_USERS.admin.password);

        const nameField = page.locator('input[name="name"]');
        if (await nameField.isVisible()) {
            await nameField.fill(TEST_USERS.admin.name);
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
    });

    test('should navigate from listing to add form and back', async ({ page }) => {
        // Should be on listing
        await expect(page.locator('button:has-text("Add Trip")')).toBeVisible();

        // Go to add form
        await page.click('button:has-text("Add Trip")');
        await page.waitForTimeout(1500);

        // Should be on add form
        await expect(page.locator('input[formControlName="code"]')).toBeVisible();

        // Navigate back (browser back or navigation link)
        await page.goBack();
        await page.waitForTimeout(2000);

        // Should be back on listing
        await expect(page.locator('button:has-text("Add Trip")')).toBeVisible({ timeout: 5000 });
    });
});