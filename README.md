# CS-465 Full Stack Development
## Travlr Getaways - Travel Booking Application

### Project Overview
A full-stack MEAN (MongoDB, Express, Angular, Node.js) travel booking application with customer-facing website and admin SPA.

### Architecture

**Frontend:**
- **Customer Site**: Express with Handlebars (HBS) templating - Server-side rendering for SEO and performance
- **Admin SPA**: Angular 17 - Single Page Application for dynamic admin interface

**Backend:**
- **API**: RESTful API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js, PBKDF2 password hashing

### Features

**Customer-Facing Website:**
- Browse trips with full-text search and category filtering (beach, cruise, mountain, other)
- MongoDB text index with weighted relevance ranking for search results
- User registration and login with JWT authentication
- Shopping cart system
- Trip booking with traveler count and date selection
- Checkout process with order summary
- My Bookings page to view and cancel reservations
- User account page with booking statistics

**Admin SPA:**
- Trip management (Add, Edit, Delete)
- User management (View, Delete)
- Booking management (View, Update Status, Delete)
- Statistics dashboard
- JWT-protected routes

### Installation

1. **Install Dependencies:**
```bash
npm install
cd app_admin
npm install
cd ..
```

2. **Environment Setup:**
Create `.env` file in root:
```
MONGO_URI=mongodb://localhost:27017/travlr
JWT_SECRET=your_secret_key_here
```

3. **Start MongoDB:**
```bash
mongod
```

4. **Seed Database (Optional):**
```bash
node seed.js
```

5. **Start Backend Server:**
```bash
npm start
```
Server runs on http://localhost:3000

6. **Start Angular Admin (separate terminal):**
```bash
cd app_admin
ng serve
```
Admin runs on http://localhost:4200

### Project Structure

```
travlr/
├── app_admin/              # Angular admin SPA
│   ├── src/app/
│   │   ├── components/     # Angular components
│   │   ├── models/         # TypeScript interfaces
│   │   └── services/       # Data services
├── app_api/                # Backend API
│   ├── controllers/        # API logic
│   ├── models/            # Mongoose schemas
│   └── routes/            # API routes
├── app_server/            # Customer-facing server
│   ├── controllers/       # Route controllers
│   ├── routes/           # Express routes
│   └── views/            # Handlebars templates
├── public/               # Static assets
└── app.js               # Main Express app
```

### API Endpoints

**Trips:**
- GET `/api/trips` - List all trips (supports `?search=term` and `?category=type` query params)
- POST `/api/trips` - Add trip (admin only, protected)
- GET `/api/trips/:tripCode` - Get single trip
- PUT `/api/trips/:tripCode` - Update trip (admin only, protected)
- DELETE `/api/trips/:tripCode` - Delete trip (admin only, protected)

**Authentication:**
- POST `/api/register` - Register user
- POST `/api/login` - Login user

**Bookings:**
- GET `/api/bookings` - List all bookings (protected)
- POST `/api/bookings` - Create booking (protected)
- GET `/api/bookings/user/:email` - Get user bookings (protected)
- PUT `/api/bookings/:bookingId` - Update booking (protected)
- PATCH `/api/bookings/:bookingId/status` - Update status (protected)
- DELETE `/api/bookings/:bookingId` - Delete booking (protected)

**Cart:**
- GET `/api/cart/:email` - Get cart (protected)
- POST `/api/cart/:email/items` - Add to cart (protected)
- PUT `/api/cart/:email/items/:tripCode` - Update cart item (protected)
- DELETE `/api/cart/:email/items/:tripCode` - Remove from cart (protected)
- POST `/api/cart/:email/checkout` - Checkout cart (protected)

**Users:**
- GET `/api/users` - List users (protected)
- GET `/api/users/:userId` - Get user (protected)
- DELETE `/api/users/:userId` - Delete user (protected)

### Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: Angular 17, Handlebars (HBS)
- **Authentication**: JWT, Passport.js, PBKDF2
- **Security**: express-rate-limit, express-mongo-sanitize
- **Testing**: Playwright (E2E)
- **Styling**: CSS3, Bootstrap (admin)

### Security Features

1. **Rate Limiting (Brute Force Prevention)**
   - Login endpoint: 5 attempts per 15 minutes
   - Registration endpoint: 3 attempts per hour
   - Returns 429 status with user-friendly error messages
   - Tracks by IP address using express-rate-limit

2. **Role-Based Access Control (RBAC)**
   - User roles: 'user' (default) and 'admin'
   - Admin-only endpoints: POST/PUT/DELETE trips
   - Role included in JWT payload for authorization
   - Returns 403 "Admin access required" for unauthorized attempts

3. **Input Sanitization (NoSQL Injection Prevention)**
   - express-mongo-sanitize middleware
   - Strips `$` and `.` characters from request bodies
   - Prevents malicious MongoDB query injection

4. **JWT Authentication**
   - Token-based authentication with Passport.js
   - Password hashing with PBKDF2 (1000 iterations, SHA-512)
   - Secure HTTP-only cookies for customer site
   - Authorization headers for admin SPA
   - 1-hour token expiration

**Admin User Setup:**
```bash
# Create admin user for testing RBAC
node create-admin.js

# Default credentials:
# Email: admin@travlr.com
# Password: Admin123!
```

### Testing

**Customer Site:** http://localhost:3000
- Register/Login
- Browse trips
- Add to cart
- Complete checkout
- View bookings

**Admin Site:** http://localhost:4200
- Login with admin credentials
- Manage trips, users, and bookings

**E2E Testing with Playwright:**

The project includes comprehensive end-to-end tests covering customer site, admin SPA, and authentication security.

```bash
# Install Playwright (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test suite
npx playwright test --project=customer-site
npx playwright test --project=admin-spa
npx playwright test --project=auth-tests

# Run specific test file
npx playwright test e2e/customer.spec.js
npx playwright test e2e/admin.spec.js
npx playwright test e2e/auth.spec.js

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in UI mode (interactive)
npx playwright test --ui

# View test report
npx playwright show-report
```

**Test Coverage:**
- **Customer Site (20 tests):** Homepage, trip browsing, search/filter with relevance ranking, authentication, cart
- **Admin SPA (17 tests):** Login, trip CRUD operations, navigation
- **Security (17 tests):** Protected routes, API authentication, JWT validation
- **Total: 54 tests**

**Note:** Before running tests, ensure both servers are running:
- Backend: `npm start` (port 3000)
- Admin: `cd app_admin && ng serve` (port 4200)

---

### Author
Omer Cengiz | SNHU | CS-465 Full Stack Development