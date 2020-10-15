// This file was created while following this youtube tutorial:
// https://www.youtube.com/watch?v=4yqu8YF29cU

const express = require('express');
const mongoose = require('mongoose');

const { User, Course } = require('../../dbSchemas/attendanceSchema');

const router = express.Router();

// Take the username and password from environment values
/* 
When setting up your environment for the first time you just need to create a file
called .env and add the following in it: (replace the user/password values with your own)
NODE_ENV=dev
DB_USERNAME=Root
DB_PASSWORD=Testing123
DB_CLUSTER_URI=athena.8ymku.gcp.mongodb.net   # <-- You can change this to your own mongodb database if you want
DB_NAME=Test #<-- You can change this to your own database name

PROD_DB_CLUSTER_URI=athena.8ymku.gcp.mongodb.net
PROD_DB_NAME=Athena
*/
console.log(process.env.NODE_ENV)

const username = encodeURIComponent(process.env.DB_USERNAME);
const password = encodeURIComponent(process.env.DB_PASSWORD);
const clusterUrl = process.env.NODE_ENV == 'dev' ? 
    encodeURIComponent(process.env.DB_CLUSTER_URI) : 
    encodeURIComponent(process.env.PROD_DB_CLUSTER_URI);
const database = process.env.NODE_ENV == 'dev' ? 
    encodeURIComponent(process.env.DB_NAME) : 
    encodeURIComponent(process.env.PROD_DB_NAME);;
const authMechanism = "DEFAULT";
const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/${database}?retryWrites=true&w=majority&authMechanism=${authMechanism}`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });


// ===== GET requests =====

router.get('/course', (req, res) => {
    // Return courses based on query passed in url
    const query = req.query;
    Course.find(query)
        .then(courses => {
            res.json({
                confimation: 'success',
                data: courses
            })
        })
        .catch(err => {
            res.json({
                confirmation: 'fail',
                message: err.message
            })
        });

    /* Example urls with a query:
    http://localhost:3000/api/test/course?name=Bob
    http://localhost:3000/api/test/course?email=Fred@email.com
    */
});

router.get('/user', (req, res) => {
    // Return all users
    User.find({})
        .then(user => {
            res.json({
                confimation: 'success',
                data: user
            })
        })
        .catch(err => {
            res.json({
                confirmation: 'fail',
                message: `User ${id} not found.`
            })
        });
});

router.get('/user/:id', (req, res) => {
    // Return user based on id
    const id = req.params.id;
    User.findById(id)
        .then(user => {
            res.json({
                confimation: 'success',
                data: user
            })
        })
        .catch(err => {
            res.json({
                confirmation: 'fail',
                message: `User ${id} not found.`
            })
        });

    /* Example urls:
    http://localhost:3000/api/test/user/1234566
    http://localhost:3000/api/test/user/5f878d34997d4deb2db4112 
    */
});


// ===== POST requests =====

router.post('/user', (req, res) => {
    console.log(req.body);
    User.create(req.body)
        .then(user => {
            res.json({
                confimation: 'success',
                data: user
            })
        })
        .catch(err => {
            res.json({
                confirmation: 'fail',
                message: err.message
            })
        });
    /* Example post request body (using Postman and sent in the body as 'x-www-form-urlencoded')
    name:Jo
    email:Jo@email.com
    password:66721aflw
    is_professor:false
    is_student:true
    student_number:11252
    */
});


// ===== PUT requests =====

router.put('/user/update', (req, res) => {
    // Update a user given the id and the fields to update
    const query = req.body // require: id, key=value
    const userID = query.id;
    // Remove id from the query
    delete query['id'];

    /* The option{new:true} means the returned result will be 
    the user data after it has been updated, rather than the 
    default which returns the user data before the update.*/
    User.findByIdAndUpdate(userID, query, {new:true})
        .then(updatedUser => {
            res.json({
                confimation: 'success',
                data: updatedUser
            })
        })
        .catch(err => {
            res.json({
                confirmation: 'fail',
                message: `Could not update user ${userID}.`
            })
        });

    /* Example put request: (using Postman and sent in the body as 'x-www-form-urlencoded')
    id:5f8792282fe64564f4978dd5
    name:Boby
    email:test@email.com
    */
})


// ===== DELETE requests =====

router.delete('/user/delete/:id', (req, res) => {
    // Delete user based on id
    const userID = req.params.id;

    User.findByIdAndRemove(userID)
        .then(() => {
            res.json({
                confimation: 'success',
                data: `User ${userID} successfuly deleted.`
            })
        })
        .catch(err => {
            res.json({
                confirmation: 'fail',
                message: `Could not delete user ${userID}.`
            })
        });
    
    /* Example delete request:
    http://localhost:3000/api/test/user/delete/5f879344f63e943778c1ff60
    */
})


module.exports = router;