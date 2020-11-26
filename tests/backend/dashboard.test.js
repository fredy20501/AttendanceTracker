const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');

const { User, Course, SeatingLayout } = require('dbSchemas/attendanceSchema.js');

describe('Dashboard api fuctionality', () => {
    
    let server;
    let request;

    //Open server & database before running tests
    beforeAll(async (done) => {
        server = http.createServer(app);
        server.listen();
        request = supertest(server);
        const db = mongoose.connection;
        db.once('open', done);
    });

    //Close server & database when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });

    it("Should reach getCourseView endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user
        response = await request.get("/api/dashboard/getCoursesCreatedByProfessor").query({
            professorID: prof1.id
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
    });

    it("Should reach getCoursesByStudent endpoint", async done => {
        //from here
        var response = await request.post("/api/login").send({
            email:'test.student@unb.ca', 
            password:'testing123'
        });
        //to here will always be the same (we need to login first)

        const st1 = response.body.user
        response = await request.get("/api/dashboard/getCoursesByStudent").query({
            studentID: st1.id
        });


        //here
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
        //to here wont change either
    });

    //covers 27-28
    //when this test is run, as prof and student ids are both numerical, it finds a 
    //student with an id matching that of the professor, this needs to be fixed
    it("Should not reach getCoursesByStudent endpoint with improper parameter", async done => {
        //from here
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        //to here will always be the same (we need to login first)

        //send a prof, (which is invalid for a student)
        const prof1 = response.body.user
        response = await request.get("/api/dashboard/getCoursesByStudent").query({
                studentID: '999999999999'
        });

        //here
        expect(response.status).toBe(500);
        await request.get("/api/logout");
        done();
        //to here wont change either
    });

    //covers 51-52
    //when this test is run, as prof and student ids are both numerical, it finds a 
    //student with an id matching that of the professor, this needs to be fixed
    it("Should not reach getCoursesCreatedByProfessor endpoint with improper parameter", async done => {
        //from here
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        //to here will always be the same (we need to login first)

        //send a prof, (which is invalid for a student)
        const st1 = response.body.user
        response = await request.get("/api/dashboard/getCoursesCreatedByProfessor").query({
            professorID: '999999999999'
        });

        //here
        expect(response.status).toBe(500);
        await request.get("/api/logout");
        done();
        //to here wont change either
    });


    //register for course endpoint tests


    it("Should reach registerForCourse endpoint", async done => {

        //login as professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        const prof1 = response.body.user;

        response = await request.delete("/api/delete-user").send({
            email: 'admin5@test.com'
        });

        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection2' 
        });

        //create an admin
        response = await request.post('/api/register').send({
            email: 'admin5@test.com',
            name: 'An Admin5',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user;


        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout'
        });

        //create a layout
        // Create a sample seating layout for this test
        response = await request.post('/api/section/createSeatingLayout').send({
            name: 'testLayout',
            capacity: 4,
            dimensions: [ 2 , 2],
            layout: [
                [1, 1],
                [1, 1]
            ], 
            default: true,
            description: 'This is a sample',
            createdBy: prof1._id
        });
        const layout1 = response.body.seatingLayout
        
        //console.log("admin kinda breaks here");
        //console.log(response);

        //create test section
        response = await request.post('/api/section/createSection').send({
            courseName: 'testSection2',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,//layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            maxCapacity: 25,
            seatingArrangement: [
                [null, null, null, null, null],
            ],
            classList: [],
            attendance: [Date.now(), null, false]
        });
        const se1 = response.body;
        
        //create a student

        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });



        response = await request.post('/api/register').send({
            email: 'st2@test.com',
            name: 'Student 2',
            password:'st1234',
            is_professor: false
        });
        const st1 = response.body.user

        //Search course in database by name
       /* const section1 = await Course.findOne({
            name: 'testSection'
        });

        //Check that course information is stored
        expect(section1.name).toBe('testSection');*/

        /*******************now test registering the student here*********************** */

        //to here will always be the same (we need to login first)

        //const st1 = response.body.user
        response = await request.put("/api/dashboard/registerForCourse").send({
                studentID: st1.id,
                courseName: 'testSection2'
        });

        //here
        expect(response.status).toBe(200);
        await request.get("/api/logout");

        //********* now delete it all *********** */
        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'admin5@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection2' 
        });
        
        expect(response.status).toBe(200);



        done();
        //to here wont change either
    });

    it("Should not reach registerForCourse endpoint when student already registered", async done => {

        //login as professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        const prof1 = response.body.user;

        response = await request.delete("/api/delete-user").send({
            email: 'admin42@test.com'
        });
        
        //create an admin
        response = await request.post('/api/register').send({
            email: 'admin42@test.com',
            name: 'An Admin42',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user;

        //create a layout
        var layout1 = await SeatingLayout.findOne({name:'Room102'});
        
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection' 
        });

        //create test section
        response = await request.post('/api/section/createSection').send({
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,//layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            maxCapacity: 25,
            seatingArrangement: [
                [null, null, null, null, null],
            ],
            classList: [],
            attendance: [Date.now(), null, false]
        });
        const se1 = response.body;
        
        //create a student
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });

        response = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const st1 = response.body.user;

        //Search course in database by name
       /* const section1 = await Course.findOne({
            name: 'testSection'
        });

        //Check that course information is stored
        expect(section1.name).toBe('testSection');*/

        /*******************now test registering the student here*********************** */

        console.log("student kinda breaks here");
        console.log(st1);

        //to here will always be the same (we need to login first)

        //const st1 = response.body.user
        response = await request.put("/api/dashboard/registerForCourse").send({
                studentID: st1.id,
                courseName: 'testSection'
        });

        response = await request.put("/api/dashboard/registerForCourse").send({
            studentID: st1.id,
            courseName: 'testSection'
        });

        //here
        expect(response.status).toBe(520);
        await request.get("/api/logout");

        //********* now delete it all *********** */
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'admin42@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection' 
        });
        
        expect(response.status).toBe(200);



        done();
        //to here wont change either
    });

    //need coverage for 74-75
    it("Should not reach registerForCourse endpoint when course doesnt exist", async done => {

        //login as professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        const prof1 = response.body.user;
      
        //delete st1 just incase it already exists
        response = await request.delete("/api/delete-user").send({
            email: 'st51@test.com'
        });

        //create a student
        response = await request.post('/api/register').send({
            email: 'st51@test.com',
            name: 'Student 51',
            password:'st1234',
            is_professor: false
        });
        const st1 = response.body.user

        //Search course in database by name
       /* const section1 = await Course.findOne({
            name: 'testSection'
        });

        //Check that course information is stored
        expect(section1.name).toBe('testSection');*/

        /*******************now test registering the student here*********************** */



        //to here will always be the same (we need to login first)

        //const st1 = response.body.user
        response = await request.put("/api/dashboard/registerForCourse").send({
                studentID: st1.id,
                courseName: 'testSectionabc123'
        });

        //here
        expect(response.status).toBe(530);
        await request.get("/api/logout");

        //********* now delete it all *********** */
        response = await request.delete("/api/delete-user").send({
            email: 'st51@test.com'
        });
        
        expect(response.status).toBe(200);



        done();
        //to here wont change either
    });

    //lines 88-89 log a database (course.save) error, unsure how to test that

})
