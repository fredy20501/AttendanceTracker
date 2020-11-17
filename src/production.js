const express = require('express');
const history = require('connect-history-api-fallback')
const { resolve } = require('path');
const cors = require('cors')

const app = express();
app.use(cors())

// Setup the frontend if in production (source: https://dennisreimann.de/articles/vue-cli-serve-express.html)
// Since the frontend is only a set of static pages once built we can serve them as static files on a server
const publicPath = resolve(__dirname, '../dist')
const staticConf = { maxAge: '1y', etag: false }
app.use(express.static(publicPath, staticConf))
app.use('/', history())
var config = require('./config.js');
const PORT = config.productionPort;
//const PORT = 3000//8080
app.listen(PORT, () => console.log(`Frontend server started on port ${PORT}`));