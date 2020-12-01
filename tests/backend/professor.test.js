const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const { ArchivedSection, Section, SeatingLayout } = require('dbSchemas/attendanceSchema.js');

describe('Backend server fuctionality', () => {
    
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

    it("Should reach pushNewAttendance endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        //delete users and section in case they already exist in the database
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        //delete layout in case it already exists
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        //create student 1
        response = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const student1 = response.body.user

        //create student 2
        response = await request.post('/api/register').send({
            email: 'st2@test.com',
            name: 'Student 2',
            password:'st2345',
            is_professor: false
        });
        const student2 = response.body.user

        //create a professor
        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user;

        //create an admin
        response = await request.post('/api/register').send({
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user

        //create a sample seating layout
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
            createdBy: prof1
        });
        const layout1 = response.body.seatingLayout

        //create a test section
        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            students: [student1, student2],
            maxCapacity: 30,
            seatingArrangement: [
                [null, student1, null, null, null],
            ],
            classList: [],
            attendance: [Date.now(), student1, false]
        });
        const section1 = response.body.newSection

        response = await request.put("/api/professor/pushNewAttendance").send({
            sectionID: section1._id,
            absent_students: [student1],
            mandatory: false
        });
        expect(response.status).toBe(200);

        //delete users, section & layout after testing
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        await request.get("/api/logout");

        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        done();
    });


    it("Can get attendance data", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        // Delete users and section in case they already exist in the database
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout'
        });

        // Create a sample user, seating layout, and section for this test
        response = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const student1 = response.body.user;

        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user;

        response = await request.post('/api/section/createSeatingLayout').send({
            name: 'testLayout',
            capacity: 4,
            dimensions: [2 , 2],
            layout: [
                [1, 1],
                [1, 1]
            ], 
            default: true,
            description: 'This is a sample',
            createdBy: prof1._id
        });
        const layout1 = response.body.seatingLayout;

        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            maxCapacity: 4,
            seatingArrangement: [
                [null, null],
                [null, null]
            ]
        });
        const section1 = response.body.newSection;

        // Add attendance to the section
        response = await request.put("/api/professor/pushNewAttendance").send({
            sectionID: section1._id,
            absent_students: [student1._id],
            mandatory: false,
        });
        expect(response.status).toBe(200);

        // Make sure getAttendanceData endpoint works
        response = await request.get("/api/professor/getAttendanceData").query({
            sectionID: section1._id
        });
        expect(response.status).toBe(200);
        expect(response.body.attendanceData[0].absent_students[0]._id).toBe(student1._id);

        // Delete test data
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout'
        });
        await request.get("/api/logout");

        done();
    });


    it("Should reach clearStudents endpoint", async done => {
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
            students: [student1._id],
            maxCapacity: 30,
            seatingArrangement: [
                [null, student1._id],
                [null, null],
            ],
        });
        const section1 = response.body.newSection

        // Clear students
        response = await request.put("/api/professor/clearStudents").send({
            sectionID: section1._id,
        });
        expect(response.status).toBe(200);

        // Check section to make sure it worked as expected
        const newSection1 = await Section.findById(section1._id);
        // Registered students should be empty
        expect(newSection1.registered_students.length).toBe(0);
        // Student1 should have lost their seat
        expect(newSection1.seating_arrangement[0][1]).toBe(null);
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


    it("clearStudents should fail when section does not exist", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        // Try to clear students for a section that doesn't exist
        response = await request.put("/api/professor/clearStudents").send({
            sectionID: '123456789012'
        });
        expect(response.status).toBe(500);

        await request.get("/api/logout");
        done();
    });


    it("Should reach archiveSection endpoint", async done => {
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
        await ArchivedSection.deleteOne({name: 'testSection'}).exec();
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

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
                [null, null],
                [null, null],
            ],
        });
        const section1 = response.body.newSection

        // Archive section
        response = await request.post("/api/professor/archiveSection").send({
            sectionID: section1._id
        });
        expect(response.status).toBe(200);
        // Make sure it is not in the Section collection anymore
        response = await Section.findById(section1._id).exec();
        expect(response).toBe(null)
        // Make sure it is in the ArchivedSection collection
        const archivedSection = await ArchivedSection.findById(section1._id).exec();
        expect(archivedSection).not.toBe(null);

        // Delete test data
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        await ArchivedSection.findByIdAndDelete(section1._id).exec();
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        await request.get("/api/logout");
        done();
    });


    it("archiveSection should fail when section does not exist", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        // Try to archive a section that does not exist
        response = await request.post("/api/professor/archiveSection").send({
            sectionID: '123456789012'
        });
        expect(response.status).toBe(500);

        await request.get("/api/logout");
        done();
    });

})