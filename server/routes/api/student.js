const express = require('express');
const router = express.Router();
var { Course, SeatingLayout } = require('../../dbSchemas/attendanceSchema');


// allows updating a seating layout given a student id
router.put('/updateStudentCourseView', (req, res) => {
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