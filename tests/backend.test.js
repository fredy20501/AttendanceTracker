const app = require('../server/app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');

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

    //Close server & database when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });

    it('Should reach server api', async done => {
        const response = await request.get("/");
        expect(response.status).toBe(200);
        done();
    });

    it('Should send invalid login', async done => {
        const response = await request.post("/api/login").send({
            email:'blah', 
            password:'bbbbbb'
        });
        // expect 401 since user should not exist
        expect(response.status).toBe(401);
        done();
    });

    it('Should not allow access to data without being logged in', async done => {
        const response = await request.get("/api/dashboard");
        expect(response.status).toBe(401);
        done();
    });

    it('Should successfully create, login, logout, and delete test account', async done =>{
        // Delete test account (if it exists)
        response = await request.delete("/api/delete-user").send({
            email: '123test@test456.com'
        });
        
        // Create test account
        var response = await request.post("/api/register").send({
            name:'test_user', 
            email:'123test@test456.com', 
            password:'12345',
            is_professor: false
        });
        expect(response.status).toBe(200);

        // Login
        response = await request.post("/api/login").send({
            email:'123test@test456.com', 
            password:'12345'
        });
        expect(response.status).toBe(200);

        // Logout
        response = await request.get("/api/logout");
        expect(response.status).toBe(200);

        // Delete test account
        response = await request.delete("/api/delete-user").send({
            email: '123test@test456.com'
        });
        expect(response.status).toBe(200);

        done();
    });

    it("Should reach createSeatingLayout and deleteSeatingLayout endpoints", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user
        
        // Delete before to make sure it doesn't exist
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });

        // Create layout successfully
        response = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: true,
            description: 'test',
            createdBy: prof1._id
        });
        expect(response.status).toBe(200);

        // Delete layout successfully
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        expect(response.status).toBe(200);

        await request.get("/api/logout");
        done()
    });

    it("Should reach createSection endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection' 
        });

        response = await request.post('/api/register').send({
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user

        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user

        response = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1._id
        });
        const layout1 = response.body.seatingLayout

        response = await request.post("/api/section/createSection").send({
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");

        //delete testing objects
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        expect(response.status).toBe(200);
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        expect(response.status).toBe(200);
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        expect(response.status).toBe(200);

        done()
    });

    it("Should reach updateSection endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
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

        response = await request.post('/api/register').send({
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user

        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user

        response = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1._id
        });
        const layout1 = response.body.seatingLayout

        response = await request.post("/api/section/createSection").send({
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        const course1 = response.body.newSection
        console.log("COURSE: ", course1)
        console.log("RESPONSE: ", response.body)

        response = await request.post("/api/section/updateSection").send({
            courseId: course1._id,
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");

        //delete testing objects
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        expect(response.status).toBe(200);
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        expect(response.status).toBe(200);
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        expect(response.status).toBe(200);

        done();
    });

    it("Should reach deleteSection endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection' 
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
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
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout'
        });

        response = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const student1 = response.body.user

        response = await request.post('/api/register').send({
            email: 'st2@test.com',
            name: 'Student 2',
            password:'st2345',
            is_professor: false
        });
        const student2 = response.body.user

        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user;

        response = await request.post('/api/register').send({
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user

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
            createdBy: prof1
        });
        const layout1 = response.body.seatingLayout

        //Create test course
        response = await request.post('/api/section/createSection').send({
            courseName: 'testSection',
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
        const course1 = response.body.newSection

        response = await request.put("/api/professor/pushNewAttendance").send({
            courseID: course1._id,
            absent_students: [student1],
            mandatory: false
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");

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
        expect(response.status).toBe(200);

        done();

    });

    it("Should reach getCourseView endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user
        response = await request.get("/api/dashboard/getCoursesCreatedByProfessor", {
            params: {
                professorID: prof1.id
            }
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
    });

})