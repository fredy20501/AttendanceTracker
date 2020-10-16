var express = require('express');
var router = express.Router();
var { Course, User } = require('../../dbSchemas/attendanceSchema');

router.get('/', function(req, res){
    // res.render('index', {title : 'Express'});
    res.status(200).send();
});

router.post('/login', function (req, res){
    var email = req.body.email;
    var password = req.body.password;

    console.log("login request received");
    console.log(req.body);

    User.findOne({email: email, password: password}, function (err, user){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        if(!user){
            return res.status(401).send();
        }

        // this logs in user
        req.session.user = user;
        return res.status(200).json({ is_professor: user.is_professor }).send();
    })
});

// the following is a test to test to see if you are logged in correctly
// may be copied and changed as needed
router.get('/dashboard', function(req, res){
    if(!req.session.user){
        console.log("Unuathorized request. Please login.");
        return res.status(401).send();
    }  

    return res.status(200).send("Welcome to super-secret API");

});

router.get('/logout', function(req, res){
    req.session.destroy();
    return res.status(200).send();
});


router.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var is_professor = req.body.is_professor;
    
    console.log('register request received');
    console.log(req.body);

    var newUser = new User();
    newUser.name = name;
    newUser.password = password;
    newUser.email = email;
    newUser.is_professor = is_professor;

    newUser.save(function(err, savedUser) {
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send(); 

    })
});


router.delete('/delete-user', function(req, res){
    // Delete all users with the given email 
    // (should only delete one since emails are unique)
    var email = req.body.email;

    console.log('delete request received');
    console.log(req.body);

    User.deleteMany({ email: email }, function(err) {
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send(); 
    });
});


// router.post('/register', function(req, res){
//     var username = req.body.username;
//     var password = req.body.password;
//     var firstname = req.body.firstname;
//     var lastname = req.body.lastname;

//     var newUser = new User();
//     newUser.username = username;
//     newUser.password = password;
//     newUser.firstname = firstname;
//     newUser.lastname = lastname;
//     newUser.save(function(err, savedUser) {
//         if(err){
//             console.log(err);
//             console.log("My err");
//             return res.status(500).send();
//         }

//         return res.status(200).send(); 

//     })
// });

module.exports = router;