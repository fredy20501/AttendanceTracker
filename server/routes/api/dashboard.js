const express = require('express');
const router = express.Router();
let {
    Section
} = require('../../dbSchemas/attendanceSchema');


/**GETS all the sections registered by a student
 * ==========================================
 * Example api call body:
 * {
	"studentID": "5f984a44da9eb32ba01d31dd"
    }
 */
router.get('/getSectionsByStudent', (req, res) => {
    // Note: for get requests data is sent through query params
    let studentID = req.query.studentID;

    Section.find({
        registered_students: {
            $in: [studentID]
        }
    })
    .populate('professor')
    .exec(function (err, sections) {
        if (err || sections == null || sections.length == 0) {
            console.log(err);
            return res.status(500).send(err);
        }
        res.status(200).send(sections);
    });
});



/**GETS all the sections created by a professor
 * ==========================================
 * Example api call body:
 * {
	"studentId": "5f98967d62a8bb73a0f8c046"
    }
 */
router.get('/getSectionsCreatedByProfessor', (req, res) => {
    // Note: for get requests data is sent through query params
    let professorID = req.query.professorID;

    Section.find({
        professor: professorID
    })
    .populate('professor')
    .exec(function (err, sections) {
        if (err || sections == null || sections.length == 0) {
            console.log(err);
            return res.status(500).send(err);
        }
        res.status(200).send(sections);
    });
});

/** Registers a student to his section
 *  We give a student ID
 *  Returns section data (name, prof name, if it's mandatory)
 */
router.put('/registerForSection', (req, res) => {
    let studentID = req.body.studentID;
    let sectionName = req.body.sectionName;
    console.log("register for section");

    Section.findOne({
        name: sectionName
    }, function (err, section) {
        if (err || section == null) {
            console.log(err);
            return res.status(530).send(err);
        }

        // check to see if student is already registered
        if(section.registered_students.indexOf(studentID) != -1){
            return res.status(520).send(err);
        }

        // push new student into array
        section.registered_students.push(studentID);

        section.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            // return section information
            return res.status(200).json({
                section
            });
        })
    });
});



module.exports = router;