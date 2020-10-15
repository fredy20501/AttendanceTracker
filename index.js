const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hellow, World!');
});

app.get('/login', (req, res) => {
    res.send('Login successful');
});

const server = app.listen(port, () => {
    console.log('App running on port '+port);
});

module.exports = server;