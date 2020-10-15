const express = require('express');

const app = express();
const port = 3000;

// Load environment variables from .env files
require('dotenv').config();

// Middleware
app.use(express.urlencoded()); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Parse JSON bodies (as sent by API clients)

// Define an api route
const test = require('./routes/api/example_mongoose');
app.use('/api/test', test);

const server = app.listen(port, () => {
    console.log('App running on port '+port);
});

module.exports = server;