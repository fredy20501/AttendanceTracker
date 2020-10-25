const app = require('./app');

const PORT = process.env.PORT || 3000;//shouldnt we use whats in /config/config.js before just 5000?

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
