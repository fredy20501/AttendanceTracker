const app = require('./app');

var config;
if (!process.env.TRAVIS) {
  config = require('./config/config.js');
}
// Don't change the default port (5000) since both frontend 
// and backend assume 5000 if config is missing.
// Change the value in the config file to specify the port you want.
const PORT = config ? config.app.port : 5000;

app.listen(PORT, () => console.log(`Backend server started on port ${PORT}`));
