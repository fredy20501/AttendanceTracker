const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const config = require('./config/config.js')
// use the local one for local testing

const connectionString = `mongodb+srv://${config.db.username}:${config.db.password}@athena.8ymku.gcp.mongodb.net/Athena?retryWrites=true&w=majority`;

// mongoose.connect('mongodb://localhost/test1', {useNewUrlParser: true});
mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology : true});

const app = express();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("mongodb connection successful")
});

// // Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
// TODO: change the secret key
app.use(session({secret:"34h3k24h32k4jh23k4jh23", resave: false, saveUninitialized: true}));


app.get('/', (req,res) => {
    res.send('<h1>Hello World!!!</h1>');
    // res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Members API Routes
// app.use('/api/members', require('./routes/api/members'));
app.use('/api/', require('./routes/api/login'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sernodver started on port ${PORT}`));

module.exports = app;