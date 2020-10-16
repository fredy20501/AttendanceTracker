var express = require('express');
var router = express.Router();
var User = require('../../dbSchemas/User');

router.get('/', function(req, res, next){
    res.render('index', {title : 'Express'});
});

router.post('/login', function (req, res){
    var email = req.body.email;
    var password = req.body.password;

    console.log("login request received");

    User.findOne({email: email, password: password}, function (err, user){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        if(!user){
            return res.status(404).send();
        }

        // this logs in user
        req.session.user = user;
        return res.status(200).send();
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