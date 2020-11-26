const express = require('express');
const router = express.Router();
let {
    Course,
    ArchivedSection
} = require('../../dbSchemas/attendanceSchema');

/**pushes a new attendance object to a course
 * ==========================================
 * Example api call body:
 * {
	"courseID": "5f9aa985a74e0454388aa083",
	"absent_students": [{"_id": "5f983d516d53d00fbcde147d"}, {"_id": "5f983d516d53d00fbcde147d"}],
    "mandatory": true
    }
 */
router.put('/pushNewAttendance', (req, res) => {
    let courseID = req.body.courseID;
    let absent_students = req.body.absent_students;
    let mandatory = req.body.mandatory;

    Course.findOne({
        _id: courseID
    }, function (err, course) {

        if (err || course == null) {
            console.log(err);
            console.log("Not found");
        }

        let newAttendance = {
            date: Date.now(),
            absent_students: absent_students,
            mandatory: mandatory
        }

        course.attendance.push(newAttendance);

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

/**
 * allows the professor to delete a course
 * and archives the section 
 * ================================
 * Example API body call:
 * {
 *   "sectionID" : "5fbbeebc85d6314ab80bfc07"
 * }
 */
router.post('/archiveSection', (req, res) => {
    let sectionID = req.body.sectionID;

    Course.findOne({ _id: sectionID }, function(err, course) {

        if (err || course == null) {
            console.log(err);
            return res.status(500).send(err);
        }

        let swap = new (ArchivedSection)(course.toJSON())
        course.remove(err => {
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
