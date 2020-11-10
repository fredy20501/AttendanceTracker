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
        await server.close(done);
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

    it("Should reach create-seating-plan endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        const prof1 = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });

        response = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1.id
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        done()
    });
    /* No update-seating-plan endpoint
    xit("Should reach update-seating-plan endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        response = await request.get("/api/section/updateSeatingLayout");
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
    });
    */
    it("Should reach delete-seating-plan endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
    });

    it("Should reach create-section endpoint", async done => {
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

        const admin1 = await request.post('/api/register').send({
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const prof1 = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });

        const layout1 = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1.id
        });

        response = await request.post("/api/section/createSection").send({
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1.id, //does not like this. no clue why.
            attMandatory: false,
            professor: prof1.id,
            admin: admin1.id,
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

    xit("Should reach update-section endpoint", async done => {
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

        const admin1 = await request.post('/api/register').send({
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const prof1 = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });

        const layout1 = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1.id
        });

        const course1 = await request.get("/api/section/createSection").send({
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1.id,
            attMandatory: false,
            professor: prof1.id,
            admin: admin1.id,
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });

        response = await request.get("/api/section/updateSection").send({
            courseId: course1.id,
            courseName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1.id,
            attMandatory: false,
            professor: prof1.id,
            admin: admin1.id,
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

    it("Should reach delete-section endpoint", async done => {
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


})