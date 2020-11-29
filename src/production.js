const express = require('express');
const history = require('connect-history-api-fallback')
const { resolve } = require('path');
const cors = require('cors')

const PORT = 3000;

const app = express();
app.use(cors({
    origin: [
      'http://athena.xn--9xa.network:'+PORT,
      'https://athena.xn--9xa.network:'+PORT
    ],
    credentials: true,
    exposedHeaders: ['set-cookie']
  }))

// Setup the frontend if in production (source: https://forum.vuejs.org/t/how-do-i-implement-connect-history-api-fallback-so-that-url-paths-redirect-to-index-html/10938/2)
// Since the frontend is only a set of static pages once built we can serve them as static files on a server
const publicPath = resolve(__dirname, '../dist')
const staticFileMiddleware = express.static(publicPath)
app.use(staticFileMiddleware)
app.use(history())
app.use(staticFileMiddleware) 
// ^ Included twice on purpose

app.listen(PORT, () => console.log(`Frontend server started on port ${PORT}`));