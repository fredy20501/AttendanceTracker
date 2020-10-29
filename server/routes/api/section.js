const express = require('express');
const router = express.Router();
var { Course, SeatingLayout } = require('../../dbSchemas/attendanceSchema');

router.get('/', (req, res) => {


});

router.get('/previousSeatingPlans', (req, res) => {
    // this is the professor ID
    let professor = req.body.professor;

    SeatingLayout.find({$or : [{default: true} , {created_by : professor}]}, function(err, seatingLayout){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).json({
            seatingLayout
        }).send();
    })


});

router.post('/createSeatingLayout', (req,res) => {
    let name  = req.body.name;
    let capacity  = req.body.capacity;
    let dimension  = req.body.dimensions;
    let layout  = req.body.layout;
    let def = req.body.default;
    let description  = req.body.description;
    let createdBy = req.body.createdBy;

    const seatingLayout = new SeatingLayout();
    seatingLayout.name = name;
    seatingLayout.capacity = capacity;
    seatingLayout.dimensions = dimension;
    seatingLayout.default = def;
    seatingLayout.layout = layout;
    seatingLayout.description = description;
    seatingLayout.created_by = createdBy;

    seatingLayout.save(err => {
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(200).send(); 
    })
});


router.post('/createSection', (req, res) => {
    let courseName = req.body.courseName;
    let attendanceThreshold = req.body.attendanceThreshold;
    let seatingLayout = req.body.seatingLayout;
    let attMandatory = req.body.attMandatory;
    let professor = req.body.professor;
    let admin = req.body.admin;
    let students = req.body.students;
    let maxCapacity = req.body.maxCapacity;
    let seatingArrangement = req.body.seatingArrangement;
    let attendance = [];

    const newSection = new Course();
    newSection.name = courseName;
    newSection.admin = admin;
    newSection.professor = professor;
    newSection.students = students;
    newSection.max_capacity = maxCapacity;
    newSection.seating_layout = seatingLayout;
    newSection.attendance  = attendance;
    newSection.always_mandatory = attMandatory;
    newSection.attendance_threshold = attendanceThreshold;
    newSection.seating_arrangement = seatingArrangement;

    newSection.save(err => {
    if(err){
        console.log(err);
        return res.status(500).send(err);
    }

    return res.status(200).send(); 
    })

});


//currently unfinished
router.get('/updateSection', (req, res) => {

    let courseId = req.body.courseId;
    let courseName = req.body.courseName;
    let attendanceThreshold = req.body.attendanceThreshold;
    let seatingLayout = req.body.seatingLayout;
    let attMandatory = req.body.attMandatory;
    let professor = req.body.professor;
    let admin = req.body.admin;
    let students = req.body.students;
    let maxCapacity = req.body.maxCapacity;
    let seatingArrangement = req.body.seatingArrangement;
    let attendance = [];

    Course.findOne({_id: courseId}, function (err, course) {
        console.log(courseName);
        console.log(course)

        if(err || course == null){
            console.log(err);
            return res.status(500).send(err);
        }

        if(courseName != null && courseName !== ""){
            course.name = courseName;
        }
        if(attendanceThreshold != null && attendanceThreshold !== ""){
            course.attendance_threshold = attendanceThreshold;
        }
        if(seatingLayout != null && seatingLayout !== ""){
            course.seating_layout = seatingLayout;
        }
        if(attMandatory != null && attMandatory !== ""){
            course.always_mandatory = attMandatory;
        } 
        if(professor != null && professor !== ""){
            course.professor = professor;
        }
        if(admin != null && admin !== ""){
            course.admin = admin;
        }
        if(students != null && students !== ""){
            course.students = students
        }
        if(maxCapacity != null && maxCapacity !== ""){
            course.max_capacity = maxCapacity;
        }
        if(seatingArrangement != null && seatingArrangement !== ""){
            course.seating_arrangement = seatingArrangement;
        }
        if(Array.isArray(attendance) && attendance.length){
            course.attendance = attendance;
        }
    
        course.save(err => {
            if(err){
                console.log(err);
                return res.status(500).send(err);
            }
        
            return res.status(200).send(); 
        })
    });
});


router.delete('/deleteSeatingLayout', (req, res) => {
    // Delete all seating layouts with the given name 
    // (should only delete one since emails are unique)
    var name = req.body.name;

    SeatingLayout.deleteMany({ name: name }, (err) => {
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send(); 
    });
});

router.delete('/deleteSection', (req, res) => {
    // Delete all sections with the given name 
    // (should only delete one since emails are unique)
    var name = req.body.name;

    Course.deleteMany({ name: name }, (err) => {
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).send(); 
    });
});

module.exports = router;