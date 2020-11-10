const express = require('express');
const { resolve } = require('path');

const app = express();

// Setup the frontend if in production (source: https://dennisreimann.de/articles/vue-cli-serve-express.html)
if (process.env.NODE_ENV === 'production') {
  // Since the frontend is only a set of static pages once built we can serve them as static files on a server
  const publicPath = resolve(__dirname, '../dist')
  const staticConf = { maxAge: '1y', etag: false }
  app.use(express.static(publicPath, staticConf))
  app.use('/', history())
}

const PORT = 8080
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));