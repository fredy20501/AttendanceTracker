const app = require('app.js');
const mongoose = require('mongoose');
const test = require('./testFunctions.js');

// Note that we need to import app.js since it opens the database connection
app;

// Wait for database to open before running tests
const db = mongoose.connection;
db.once('open', async () => {

    // Delete test data
    await test.clearAllTestData();
    console.log("Test data cleared");

    // Close database connection when done
    await mongoose.connection.close();
});