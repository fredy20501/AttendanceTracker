const express = require('express');
const router = express.Router();
var {
    Course,
    SeatingLayout
} = require('../../dbSchemas/attendanceSchema');


// allows updating a seating layout given a student id
router.put('/updateStudentCourseView', (req, res) => {
    let courseID = req.body.courseID;
    let seatingArrangement = req.body.seatingArrangement;

    Course.findOne({
        _id: courseID
    }, function (err, course) {

        if (err || course == null) {
            console.log(err);
            console.log("Not found");
        }

        if (Array.isArray(seatingArrangement) && seatingArrangement.length) {
            course.seating_arrangement = seatingArrangement;
        }

        course.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send();
        })
    });
});


module.exports = router;