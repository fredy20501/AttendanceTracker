const express = require('express');
const router = express.Router();
var { Course, SeatingLayout } = require('../../dbSchemas/attendanceSchema');


// gets information regarding a course given a student id
router.get('/getStudentCourseView', (req, res) => {
    // this is the professor ID
    let courseID = req.body.courseID;

    Course.findOne( {_id: courseID} , function(err, course){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        seatingLayout = SeatingLayout.findOne({_id: course.seating_layout}, function(err, seatingLayout){

            let myLayout;
            if(err){
                console.log(err);
                return res.status(500).send();
            }
            console.log("HERE");
            console.log(seatingLayout);
    
            if(seatingLayout != null && seatingLayout.layout != null) {
                myLayout = seatingLayout.layout;
                console.log("?");
            } else {
                myLayout = "Layout not found";
            }

            return res.status(200).json({
                "name" : course.name,
                "alwaysMandatory" : course.always_mandatory,
                "students": course.students,
                "seatingLayout" : myLayout
            });
        })

    })


});


// allows updating a seating layout given a student id
router.post('/updateStudentCourseView', (req, res) => {
    let seatingLayoutID = req.body.seatingLayoutID;
    let layout = req.body.layout;

    SeatingLayout.findOne({_id: seatingLayoutID}, function (err, seatLayout) {

        if(err || seatLayout == null){
            console.log(err);
            console.log("Not found");
        }

        if(Array.isArray(layout) && layout.length){
            seatLayout.layout = layout;
        }
    
        seatLayout.save(err => {
            if(err){
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send(); 
        })
    });
});


module.exports = router;