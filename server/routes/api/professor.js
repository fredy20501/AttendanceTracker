const express = require('express');
const router = express.Router();
let {
    Section
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
            return res.status(500).send(err);
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

/**
 * Get all attendance objects of the specified course
 * ==========================================
 * Example api call: (note that data is passed through query params)
 { 
    params: {
        "courseID": "5f9aa985a74e0454388aa083"
    }
 }
 */
router.get('/getAttendanceData', (req, res) => {
    // Note: for get requests data is sent through query params
    let courseID = req.query.courseID;

    console.log('body', req.body)
    console.log('query', req.query)
    console.log('courseID', courseID)

    Course.findById(courseID)

    // Replace the id of students with their names
    .populate('attendance.absent_students', ['name', 'email'])
    .populate('registered_students', ['name', 'email'])

    .exec(function (err, course) {
        if (err || course == null) {
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(200).json({
            attendanceData: course.attendance,
            classList: course.class_list,
            registeredStudents: course.registered_students
        });
    });
});

module.exports = router;
