const express = require('express');
const router = express.Router();
var {
    Section,
    SeatingLayout
} = require('../../dbSchemas/attendanceSchema');


// allows updating a seating layout given a student id
router.put('/updateStudentSectionView', (req, res) => {
    let sectionID = req.body.sectionID;
    let seatingArrangement = req.body.seatingArrangement;

    Section.findOne({
        _id: sectionID
    }, function (err, section) {

        if (err || section == null) {
            console.log(err);
            console.log("Not found");
        }

        if (Array.isArray(seatingArrangement) && seatingArrangement.length) {
            section.seating_arrangement = seatingArrangement;
        }

        section.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send();
        })
    });
});


module.exports = router;