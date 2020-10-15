const express = require('express');

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded()); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Parse JSON bodies (as sent by API clients)


const server = app.listen(port, () => {
    console.log('App running on port '+port);
});

module.exports = server;