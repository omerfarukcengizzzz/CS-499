var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebars = require('hbs');

handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

// Load environment variables from .env file
require('dotenv').config();

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var travelRouter = require('./app_server/routes/travel');
var aboutRouter = require('./app_server/routes/about');
var contactRouter = require('./app_server/routes/contact');
var mealsRouter = require('./app_server/routes/meals');
var newsRouter = require('./app_server/routes/news');
var roomsRouter = require('./app_server/routes/rooms');
var registerRouter = require('./app_server/routes/register');
var loginRouter = require('./app_server/routes/login');
var bookingRouter = require('./app_server/routes/booking');
var myBookingsRouter = require('./app_server/routes/mybookings');
var cartRouter = require('./app_server/routes/cart');
var checkoutRouter = require('./app_server/routes/checkout');
var accountRouter = require('./app_server/routes/account');
var apiRouter = require('./app_api/routes/index');
var mongoSanitize = require('express-mongo-sanitize');

require('./app_api/models/db');

// Wire in our authentication module
var passport = require('passport');
require('./app_api/config/passport');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));

// register handlebars partials (https://www.npmjs.com/package/hbs)
handlebars.registerPartials(__dirname + '/app_server/views/partials');

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize()); // Sanitize inputs to prevent NoSQL injection
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Middleware to check if user is logged in
app.use((req, res, next) => {
  const token = req.cookies['travlr-token'];
  res.locals.isLoggedIn = !!token;
  next();
});

// Enable CORS
app.use("/api", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Routes - AFTER CORS middleware
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);
app.use('/meals', mealsRouter);
app.use('/news', newsRouter);
app.use('/rooms', roomsRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/booking', bookingRouter);
app.use('/mybookings', myBookingsRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/account', accountRouter);
app.use('/api', apiRouter);

// Catch unauthorized error and create 401
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res
      .status(401)
      .json({ "message": err.name + ": " + err.message });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;