const express = require('express');
const router = express.Router();
var {
    Course,
    SeatingLayout,
    User
} = require('../../dbSchemas/attendanceSchema');

router.get('/', (req, res) => {


});

// --------------- Seating Layout Methods --------------------

// gets information regarding a seating layout given a professor id
router.get('/previousSeatingPlans', (req, res) => {
    // Return all seating plans stored in the database
    // (we do not filter by professor id)
    SeatingLayout.find({}, function(err, seatingLayout){
        if(err){
            console.log(err);
            return res.status(500).send();
        }

        return res.status(200).json({
            seatingLayout
        });
    })


});

// creates a seating layout
router.post('/createSeatingLayout', (req, res) => {
    let name = req.body.name;
    let capacity = req.body.capacity;
    let dimension = req.body.dimensions;
    let layout = req.body.layout;
    let def = req.body.default;
    let description = req.body.description;
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
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        // Return the saved seatingLayout
        // (it includes the _id generated by MongoDB which the frontend needs)
        return res.status(200).json({
            seatingLayout
        });
    })
});

// --------------- Section/Course Methods --------------------

// creates a student section
router.post('/createSection', (req, res) => {
    let courseName = req.body.courseName;
    let attendanceThreshold = req.body.attendanceThreshold;
    let seatingLayout = req.body.seatingLayout;
    let attMandatory = req.body.attMandatory;
    let professor = req.body.professor;
    let admin = req.body.admin;
    let maxCapacity = req.body.maxCapacity;
    let seatingArrangement = req.body.seatingArrangement;
    let classList = req.body.classList;
    let students = [];
    let attendance = [];

    const newSection = new Course();
    newSection.name = courseName;
    newSection.admin = admin;
    newSection.professor = professor;
    newSection.registered_students = students;
    newSection.class_list = classList;
    newSection.max_capacity = maxCapacity;
    newSection.seating_layout = seatingLayout;
    newSection.attendance = attendance;
    newSection.always_mandatory = attMandatory;
    newSection.attendance_threshold = attendanceThreshold;
    newSection.seating_arrangement = seatingArrangement;

    newSection.save(err => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(200).send();
    })

});

// updates a student section
router.put('/updateSection', (req, res) => {

    let courseId = req.body.courseId;
    let courseName = req.body.courseName;
    let attendanceThreshold = req.body.attendanceThreshold;
    let seatingLayout = req.body.seatingLayout;
    let attMandatory = req.body.attMandatory;
    let professor = req.body.professor;
    let admin = req.body.admin;
    let students = req.body.students;
    let classList = req.body.classList;
    let maxCapacity = req.body.maxCapacity;
    let seatingArrangement = req.body.seatingArrangement;
    let attendance = [];

    Course.findOne({
        _id: courseId
    }, function (err, course) {
        console.log(courseName);
        console.log(course)

        if (err || course == null) {
            console.log(err);
            return res.status(500).send(err);
        }

        if (courseName != null && courseName !== "") {
            course.name = courseName;
        }
        if (attendanceThreshold != null && attendanceThreshold !== "") {
            course.attendance_threshold = attendanceThreshold;
        }
        if (seatingLayout != null && seatingLayout !== "") {
            course.seating_layout = seatingLayout;
        }
        if (attMandatory != null && attMandatory !== "") {
            course.always_mandatory = attMandatory;
        }
        if (professor != null && professor !== "") {
            course.professor = professor;
        }
        if (admin != null && admin !== "") {
            course.admin = admin;
        }
        if (students != null && students !== "") {
            course.registered_students = students
        }
        if (maxCapacity != null && maxCapacity !== "") {
            course.max_capacity = maxCapacity;
        }
        if (seatingArrangement != null && seatingArrangement !== "") {
            course.seating_arrangement = seatingArrangement;
        }
        if (Array.isArray(attendance) && attendance.length) {
            course.attendance = attendance;
        }
        if (Array.isArray(classList) && classList.length) {
            course.class_list = classList;
        }

        course.save(err => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send();
        })
    });
});


// ------------- Combined Seating Layout and Course Methods -------------

// gets information regarding a course given a course id
router.get('/getCourseView', (req, res) => {

    // Note: for get requests data is sent through query params
    let courseID = req.query.courseID;
    
    Course.findById(courseID)
    // The populate method replaces an objectId reference with the actual object
    // Documentation: https://mongoosejs.com/docs/populate.html
    .populate('professor', 'name')
    .populate('seating_layout')
    .exec()
    .then(course => {
        // Here we want to populate the seating arrangement
        // (we need to do it 'manually' since it is a 2d array)
        // Inspired by: https://stackoverflow.com/questions/55878496/mongoose-populate-on-two-dimensional-array

        // Generate all the seating arrangement position of the 2d array
        let seating_positions = [];
        for(let i=0; i<=course.seating_arrangement.length; i++) {
            for(let j=0; j<=course.seating_arrangement[0].length; j++) {
                seating_positions.push(`seating_arrangement.${i}.${j}`);
            }
        }

        // Populate all the positions of the seating_arrangement
        course.populate(seating_positions.join(' '), (err, fullCourse) => {
            if(err) {
                console.log(err)
                return res.status(500).send(err)
            }
            return res.status(200).json(fullCourse) 
        });
    })
    .catch(err => {
        console.log(err)
        return res.status(500).send(err)
    })
})


module.exports = router;
