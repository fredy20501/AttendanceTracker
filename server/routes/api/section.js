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
    let sectionName = req.body.sectionName;

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


    const updateSection =  Course.findOne({name:sectionName});

    console.log(updateSection)


    // return res.status(200).json({
    //     updateSection
    // }).send();
    // return res.status(200).send(updateSection); 


    // Course.findOne({name : sectionName}, function(err, course){

    //     if(err){
    //         console.log(err);
    //         return res.status(500).send();
    //     }

    //     if !courseName :
    //        courseName = course.courseName  


    //     course.save()

    // })
    // let section = await Course.findOne({name : sectionName}).exec();

    // console.log(section)

    // return res.status(200).send(section)


});

module.exports = router;