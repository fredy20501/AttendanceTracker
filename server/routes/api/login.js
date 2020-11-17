var express = require('express');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var router = express.Router();

const mailTransport = require("./mail");
var { User } = require('../../dbSchemas/attendanceSchema');

router.get('/', (req, res) => {
    // res.render('index', {title : 'Express'});
    res.status(200).send();
});

router.post('/login', (req, res) => {
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
        
        return res.status(200).json({
            user: {
                id: user._id, 
                name: user.name,
                email: user.email,
                is_professor: user.is_professor 
            }
        });
    })
});

// the following is a test to test to see if you are logged in correctly
// may be copied and changed as needed
router.get('/dashboard', (req, res) => {
    if(!req.session.user){
        console.log("Unuathorized request. Please login.");
        return res.status(401).send();
    }  

    return res.status(200).send("Welcome to super-secret API");

});

router.get('/logout', (req, res) => {
    req.session.destroy();
    return res.status(200).send();
});


router.post('/register', (req, res) => {
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

    newUser.save(err => {
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(200).send(); 
    })
});

router.post('/forgot-password', async(req, res) => {
    var email = req.body.email;
    
    console.log('Sent password reset request for ' + email);

    User.findOne({email: email}, function (err, user){
        if(err){
            console.log(err); //TODO: don't tell the user if/why it failed
            return res.status(500).send();
        }

        if(!user){
            return res.status(200).send(); //Don't tell the user if we don't find a match.
        }

        var passwordResetCode = crypto.randomBytes(20).toString("hex");

        var emailInfo = await mailTransport.sendMail({
            from: '"Attendance Tracker" <at@athena.xn--9xa.network>', // sender address
            to: email,
            subject: "Password reset",
            text: "Follow this link to reset your password: https://athena.xn--9xa.network/reset-password/" + passwordResetCode,
            html: "<a href=\"https://athena.xn--9xa.network/reset-password/" + passwordResetCode + "\">Click here to reset your password!"
        });

        //TODO: remove debug logging
        console.log("Message ID: " + emailInfo.messageId);
        console.log("Email preview URL: " + nodemailer.getTestMessageUrl(emailInfo));

        user.password_reset_code = passwordResetCode;
        user.save();
        
        return res.status(200).send();
    })
});

router.post('/reset-password', (req, res) => {
    var email = req.body.email;
    var passwordResetCode = req.body.passwordResetCode;
    var newPassword = req.body.newPassword;

    User.findOne({email: email, password_reset_code: passwordResetCode}, function (err, user){
        if(err){
            console.log(err); //TODO: don't tell the user if/why it failed
            return res.status(500).send();
        }

        if(!user){
            return res.status(401).send();
        }

        user.password = newPassword;
        user.save();
        
        return res.status(200).send();
    })
});

router.delete('/delete-user', (req, res) => {
    // Delete all users with the given email 
    // (should only delete one since emails are unique)
    var email = req.body.email;

    console.log('delete request received');
    console.log(req.body);

    User.deleteMany({ email: email }, (err) => {
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send(); 
    });
});

module.exports = router;