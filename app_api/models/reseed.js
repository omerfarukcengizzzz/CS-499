// Reseed script - clears and reloads trips + creates admin and test users
// Usage: node app_api/models/reseed.js
require('dotenv').config();
const Mongoose = require('./db');
const Trip = require('./travlr');
const User = require('./user');
const fs = require('fs');

const trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

const reseed = async () => {
    // Wait for DB connection
    await new Promise(resolve => {
        if (Mongoose.connection.readyState === 1) return resolve();
        Mongoose.connection.once('connected', resolve);
    });

    console.log('Connected to MongoDB. Reseeding...\n');

    // 1. Reseed trips
    await Trip.deleteMany({});
    const insertedTrips = await Trip.insertMany(trips);
    console.log(`✅ Trips: cleared and inserted ${insertedTrips.length} trips`);
    insertedTrips.forEach(t => console.log(`   - ${t.name} ($${t.perPerson}) [${t.category}]`));

    // 2. Reseed users (admin + test user)
    await User.deleteMany({});

    const admin = new User();
    admin.name = 'Admin User';
    admin.email = 'admin@travlr.com';
    admin.role = 'admin';
    admin.setPassword('admin1234');
    await admin.save();
    console.log(`\n✅ Admin user created: ${admin.email} / admin1234`);

    const testUser = new User();
    testUser.name = 'Test User';
    testUser.email = 'user@travlr.com';
    testUser.role = 'user';
    testUser.setPassword('user1234');
    await testUser.save();
    console.log(`✅ Test user created: ${testUser.email} / user1234`);

    console.log('\n🎉 Reseed complete! All data uses new schemas (600K PBKDF2, numeric prices).\n');

    await Mongoose.connection.close();
    process.exit(0);
};

reseed().catch(err => {
    console.error('Reseed failed:', err);
    process.exit(1);
});
