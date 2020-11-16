const express = require('express');
const router = express.Router();
let {
    Course
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
