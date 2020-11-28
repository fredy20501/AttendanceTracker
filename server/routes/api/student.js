const express = require('express');
const router = express.Router();
var {
    Section,
    SeatingLayout
} = require('../../dbSchemas/attendanceSchema');


// allows updating a seating layout given a student id
router.put('/updateStudentSectionView', (req, res) => {
    if (!req.session.user.is_professor == false) {
        console.log("Unuathorized request. Please login.");
        return res.status(401).send();
    }
    let sectionID = req.body.sectionID;
    let seatingArrangement = req.body.seatingArrangement;

    Section.findById(sectionID)
    .populate('seating_layout')
    .exec(function (err, section) {
        if (err || section == null) {
            console.log(err);
            return res.status(500).send(err);
        }

        // Make sure the new seating arrangement is valid
        // (must be the same size as the seating layout)
        const seatingLayout = section.seating_layout.layout;
        if (Array.isArray(seatingArrangement) 
            && seatingArrangement.length == seatingLayout.length
            && seatingArrangement[0].length == seatingLayout[0].length
        ) {
            section.seating_arrangement = seatingArrangement;
        }
        else {
            console.log("Invalid seating arrangement")
            return res.status(400).send(err);
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