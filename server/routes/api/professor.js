const express = require('express');
const router = express.Router();
let {
    Section,
    ArchivedSection
} = require('../../dbSchemas/attendanceSchema');

/**pushes a new attendance object to a section
 * ==========================================
 * Example api call body:
 * {
	"sectionID": "5f9aa985a74e0454388aa083",
	"absent_students": [{"_id": "5f983d516d53d00fbcde147d"}, {"_id": "5f983d516d53d00fbcde147d"}],
    "mandatory": true
    }
 */
router.put('/pushNewAttendance', (req, res) => {
    let sectionID = req.body.sectionID;
    let absent_students = req.body.absent_students;
    let mandatory = req.body.mandatory;

    Section.findOne({
        _id: sectionID
    }, function (err, section) {

        if (err || section == null) {
            console.log(err);
            console.log("Not found");
        }

        let newAttendance = {
            date: Date.now(),
            absent_students: absent_students,
            mandatory: mandatory
        }

        section.attendance.push(newAttendance);

        section.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            return res.status(200).send();
        })
    });
});

/**Clears the list of registered students & seating_arrangement for the given section
 * ==========================================
 * Example api call body:
 * {"sectionID": "5f9aa985a74e0454388aa083"}
 */
router.delete('/clearStudents', (req, res) => {
    let sectionID = req.body.sectionID;

    Section.findById(sectionID, function (err, section) {
        if (err || section == null) {
            console.log(err);
            console.log("Section not found");
            return res.status(500).send(err);
        }

        // Empty the list of registered students
        section.registered_students = []

        // Replace the seating arrangement with an empty 2d array of the same size
        const oldSeatingArrangement = section.seating_arrangement
        const rows = oldSeatingArrangement.length
        const columns = oldSeatingArrangement[0].length
        section.seating_arrangement = new Array(rows).fill(null).map(() => new Array(columns).fill(null))

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

/**
 * allows the professor to delete a section
 * and archives the section 
 * ================================
 * Example API body call:
 * {
 *   "sectionID" : "5fbbeebc85d6314ab80bfc07"
 * }
 */
router.post('/archiveSection', (req, res) => {
    let sectionID = req.body.sectionID;

    Section.findOne({ _id: sectionID }, function(err, section) {

        if (err || section == null) {
            console.log(err);
            return res.status(500).send(err);
        }

        let swap = new (ArchivedSection)(section.toJSON())
        section.remove(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
        })

        swap.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send();
        })
    })
});
