const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const { User, Section, SeatingLayout } = require('dbSchemas/attendanceSchema.js');

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

    //Close server & database after running tests
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });

    it("Should reach getSectionView endpoint", async done => {
        //Log in as a professor first
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user

        response = await request.get("/api/dashboard/getSectionsCreatedByProfessor").query({
            professorID: prof1.id
        });
        expect(response.status).toBe(200);
        //Log out after testing
        await request.get("/api/logout");
        done();
    });

    it("Should reach getSectionsByStudent endpoint", async done => {
        //Log in as a student first
        var response = await request.post("/api/login").send({
            email:'test.student@unb.ca', 
            password:'testing123'
        });

        const st1 = response.body.user
        response = await request.get("/api/dashboard/getSectionsByStudent").query({
            studentID: st1.id
        });

        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
    });

    it("Should not reach getSectionsByStudent endpoint with improper parameter", async done => {
        //Log in as a professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        
        //Send invalid id
        response = await request.get("/api/dashboard/getSectionsByStudent").query({
                studentID: '999999999999'
        });

        expect(response.status).toBe(500);
        await request.get("/api/logout");
        done();
    });

    it("Should not reach getSectionsCreatedByProfessor endpoint with improper parameter", async done => {
        //Log in as a professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        //Send invalid id
        response = await request.get("/api/dashboard/getSectionsCreatedByProfessor").query({
            professorID: '999999999999'
        });

        expect(response.status).toBe(500);
        await request.get("/api/logout");
        done();
    });


    // ====== Register for section endpoint tests ======

    it("Should reach registerForSection endpoint", async done => {
        //Log in as professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user;

        response = await request.delete("/api/delete-user").send({
            email: 'admin5@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection2' 
        });
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        //create an admin
        response = await request.post('/api/register').send({
            email: 'admin5@test.com',
            name: 'An Admin5',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user; 

        //create a layout
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

        //create test section
        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection2',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
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
        response = await request.post('/api/register').send({
            email: 'st2@test.com',
            name: 'Student 2',
            password:'st1234',
            is_professor: false
        });
        const st1 = response.body.user

        /*******************now test registering the student here************************/

        response = await request.put("/api/dashboard/registerForSection").send({
            studentID: st1.id,
            sectionName: 'testSection2'
        });
        expect(response.status).toBe(200);

        //********* now delete it all ************/
        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'admin5@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection2' 
        });
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        await request.get("/api/logout");
        done();
    });

    it("Should not reach registerForSection endpoint when student already registered", async done => {

        //log in as professor
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

        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        //create a layout
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
        
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection' 
        });

        //create test section
        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
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

        /******************* now test registering the student here ************************/

        response = await request.put("/api/dashboard/registerForSection").send({
            studentID: st1.id,
            sectionName: 'testSection'
        });
        // Try to register when you are already registered
        response = await request.put("/api/dashboard/registerForSection").send({
            studentID: st1.id,
            sectionName: 'testSection'
        });
        expect(response.status).toBe(520);

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
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        await request.get("/api/logout");

        done();
    });

    it("Should not reach registerForSection endpoint when section doesnt exist", async done => {

        //login as professor
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user;
      
        //delete st1 incase it already exists
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

        /******************* now test registering the student here ************************/

        response = await request.put("/api/dashboard/registerForSection").send({
            studentID: st1.id,
            sectionName: 'testSectionabc123'
        });
        expect(response.status).toBe(530);

        /********* now delete user ************/
        response = await request.delete("/api/delete-user").send({
            email: 'st51@test.com'
        });
        await request.get("/api/logout");

        done();
    });


    // ====== Drop section endpoint tests ======

    it("Should reach dropSection endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        // Delete test data in case it already exists in the database
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        // Create test users
        response = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const student1 = response.body.user

        // Create a sample seating layout for this test
        response = await request.post('/api/section/createSeatingLayout').send({
            name: 'testLayout',
            capacity: 4,
            dimensions: [2 , 2],
            layout: [
                [1, 1],
                [1, 1]
            ], 
            default: true
        });
        const layout1 = response.body.seatingLayout

        // Create test section
        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            maxCapacity: 30,
            seatingArrangement: [
                [null, student1._id],
                [null, null],
            ],
        });
        const section1 = response.body.newSection

        // Register student1 for the section
        await Section.findByIdAndUpdate(section1._id, {
            registered_students: [student1._id]
        }).exec();

        // Drop the section
        response = await request.post("/api/section/dropSection").send({
            studentID: student1._id,
            sectionID: section1._id
        });
        expect(response.status).toBe(200);

        // Check section to make sure it worked as expected
        const newSection1 = await Section.findById(section1._id);
        // Student should not be in the registered student list
        expect(newSection1.registered_students.indexOf(student1._id)).toBe(-1);
        // Student1 should have lost their seat
        expect(newSection1.seating_arrangement[0][1]).toBe(null);
        // Registered student list should have been reduced by 1
        expect(newSection1.registered_students.length).toBe(0);
        // Seating arrangement & layout should still be the same size
        expect(newSection1.seating_arrangement.length).toBe(layout1.layout.length);
        expect(newSection1.seating_arrangement[0].length).toBe(layout1.layout[0].length);


        // Delete test data
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        
        await request.get("/api/logout");
        done();
    });

    it("dropSection should fail when student is not registered for the section", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        // Delete test data in case it already exists in the database
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        // Create test users
        response = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const student1 = response.body.user

        // Create a sample seating layout for this test
        response = await request.post('/api/section/createSeatingLayout').send({
            name: 'testLayout',
            capacity: 4,
            dimensions: [2 , 2],
            layout: [
                [1, 1],
                [1, 1]
            ], 
            default: true
        });
        const layout1 = response.body.seatingLayout

        // Create test section
        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            maxCapacity: 30,
            seatingArrangement: [
                [null, student1._id],
                [null, null],
            ],
        });
        const section1 = response.body.newSection

        // Drop the section (student is not registered)
        response = await request.post("/api/section/dropSection").send({
            studentID: student1._id,
            sectionID: section1._id
        });
        expect(response.status).toBe(520);

        // Delete test data
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        
        await request.get("/api/logout");
        done();
    });

    
    it("dropSection should fail when section does not exist", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        // Try to archive a section that does not exist
        response = await request.post("/api/section/dropSection").send({
            studentID: '123456789012',
            sectionID: '123456789012'
        });
        expect(response.status).toBe(500);

        await request.get("/api/logout");
        done();
    });

})