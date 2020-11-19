const express = require('express');
const router = express.Router();
let {
    Course
} = require('../../dbSchemas/attendanceSchema');


/**GETS all the courses registered by a student
 * ==========================================
 * Example api call body:
 * {
	"studentId": "5f984a44da9eb32ba01d31dd"
    }
 */
router.get('/getCoursesByStudent', (req, res) => {
    let studentID = req.body.studentID;

    Course.find({
        registered_students: {
            $in: [studentID]
        }
    }, function (err, courses) {
        if (err || courses == null) {
            console.log(err);
            return res.status(500).send(err);
        }
        res.status(200).send(courses);
    });
});

/**GETS all the courses created by a professor
 * ==========================================
 * Example api call body:
 * {
	"studentId": "5f98967d62a8bb73a0f8c046"
    }
 */
router.get('/getCoursesCreatedByProfessor', (req, res) => {
    let professorID = req.body.professorID;

    Course.find({
        professor: professorID
    }, function (err, courses) {
        if (err || courses == null) {
            console.log(err);
            return res.status(500).send(err);
        }
        res.status(200).send(courses);
    });
});

/** Registers a student to his course
 *  We give a student ID
 *  Returns course data (name, prof name, if it's mandatory)
 */
router.put('/registerForCourse', (req, res) => {
    let studentID = req.body.studentID;
    let courseID = req.body.courseID;
    console.log("register for course");

    Course.findOne({
        _id: courseID
    }, function (err, course) {
        if (err || course == null) {
            console.log(err);
            return res.status(500).send(err);
        }

        // check to see if student is already registered
        if(course.registered_students.indexOf(studentID) != -1){
            return res.status(520).send(err);
        }

        // push new student into array
        course.registered_students.push(studentID);

        course.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            // return course information
            return res.status(200).json({
                course
            });
        })
    });
});



module.exports = router;