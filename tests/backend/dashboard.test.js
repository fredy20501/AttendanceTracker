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

    //Close server & database when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });

    it("Should reach getSectionView endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user

        response = await request.get("/api/dashboard/getSectionsCreatedByProfessor").query({
            professorID: prof1.id
        });
        expect(response.status).toBe(200);

        await request.get("/api/logout");
        done();
    });

    it("Should reach getSectionsByStudent endpoint", async done => {
        //from here
        var response = await request.post("/api/login").send({
            email:'test.student@unb.ca', 
            password:'testing123'
        });
        //to here will always be the same (we need to login first)

        const st1 = response.body.user
        response = await request.get("/api/dashboard/getSectionsByStudent").query({
            studentID: st1.id
        });

        //here
        expect(response.status).toBe(200);
        await request.get("/api/logout");
        done();
        //to here wont change either
    });

    it("Should not reach getSectionsByStudent endpoint with improper parameter", async done => {
        //from here
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        //to here will always be the same (we need to login first)
        
        // Send invalid id
        response = await request.get("/api/dashboard/getSectionsByStudent").query({
                studentID: '999999999999'
        });

        //here
        expect(response.status).toBe(500);
        await request.get("/api/logout");
        done();
        //to here wont change either
    });

    it("Should not reach getSectionsCreatedByProfessor endpoint with improper parameter", async done => {
        //from here
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        //to here will always be the same (we need to login first)

        // Send invalid id
        response = await request.get("/api/dashboard/getSectionsCreatedByProfessor").query({
            professorID: '999999999999'
        });

        //here
        expect(response.status).toBe(500);
        await request.get("/api/logout");
        done();
        //to here wont change either
    });


    // ====== Register for section endpoint tests ======

    it("Should reach registerForSection endpoint", async done => {

        //login as professor
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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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
        response = await request.post('/api/register').send({
            email: 'st2@test.com',
            name: 'Student 2',
            password:'st1234',
            is_professor: false
        });
        const st1 = response.body.user

        /*******************now test registering the student here*********************** */

        //to here will always be the same (we need to login first)

        //const st1 = response.body.user
        response = await request.put("/api/dashboard/registerForSection").send({
            studentID: st1.id,
            sectionName: 'testSection2'
        });
        expect(response.status).toBe(200);

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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

        await request.get("/api/logout");
        done();
    });

    it("Should not reach registerForSection endpoint when student already registered", async done => {

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

        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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

        /*******************now test registering the student here*********************** */

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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });
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

        /*******************now test registering the student here*********************** */

        response = await request.put("/api/dashboard/registerForSection").send({
            studentID: st1.id,
            sectionName: 'testSectionabc123'
        });
        expect(response.status).toBe(530);

        //********* now delete it all *********** */
        response = await request.delete("/api/delete-user").send({
            email: 'st51@test.com'
        });
        await request.get("/api/logout");

        done();
    });

})
