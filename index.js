const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hellow, World!');
});

const server = app.listen(port, () => {
    console.log('App running on port '+port);
});

module.exports = server;