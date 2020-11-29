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
    if (!req.session.user || !req.session.is_professor) {
        console.log("Unauthorized request. Please login.");
        return res.status(401).send();
    }
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

module.exports = router;
