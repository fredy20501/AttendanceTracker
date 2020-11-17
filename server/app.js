const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors')

var config;
if (!process.env.TRAVIS) {
  config = require('./config/config.js');
}

const username = process.env.DB_USERNAME || config.db.username;
const password = process.env.DB_PASSWORD || config.db.password;
const connectionString = `mongodb+srv://${username}:${password}@athena.8ymku.gcp.mongodb.net/Athena?retryWrites=true&w=majority`;
mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology : true, useCreateIndex:true});

const app = express();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Mongodb connection successful")
});

app.use(cors())

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// TODO: need to set a session store for production (otherwise get a warning since memory leaks can occur)
//       see: https://github.com/expressjs/session/issues/556
// TODO: change the secret key
app.use(session({secret:"34h3k24h32k4jh23k4jh23", resave: false, saveUninitialized: true}));


app.get('/', (req,res) => {
    res.send('<h1>Hello World!!!</h1>');
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/', require('./routes/api/login'));
app.use('/api/section', require('./routes/api/section'));
app.use('/api/student', require('./routes/api/student'));

module.exports = app;