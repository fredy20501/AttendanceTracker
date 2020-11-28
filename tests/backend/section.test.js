const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const {SeatingLayout } = require('dbSchemas/attendanceSchema.js');

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

    it("Should reach createSeatingLayout and deleteSeatingLayout endpoints", async done => {
        //log in as a professor
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

        //delete layout before to make sure it doesn't exist
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        //create a test layout
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

        //delete layout
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

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
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
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
            sectionName: 'testSection',
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

        //delete testing objects
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        expect(response.status).toBe(200);
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        expect(response.status).toBe(200);
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        await request.get("/api/logout");

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

        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

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
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        const section1 = response.body.newSection

        response = await request.put("/api/section/updateSection").send({
            sectionId: section1._id,
            sectionName: 'testSection',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            admin: admin1._id,
            students: [],
            maxCapacity: 30,
            classList: [
                {name: 'test1', email:'test1@unb.ca'},
                {name: 'test2', email:'test2@unb.ca'},
                {name: 'test3', email:'test3@unb.ca'},
            ],
            seatingArrangement: [] 
        });
        expect(response.status).toBe(200);

        //delete testing objects
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        expect(response.status).toBe(200);
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        expect(response.status).toBe(200);
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        await request.get("/api/logout");

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

    it("Should reach previousSeatingPlans endpoint (and it should be an array)", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        response = await request.get("/api/section/previousSeatingPlans");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.seatingLayout)).toBe(true);

        await request.get("/api/logout");
        done();
    });

    it("Should reach getSectionView endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user

        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection12'
        });
        await SeatingLayout.deleteOne({name:'testLayout12'}).exec();

        //create a sample seating layout
        response = await request.post('/api/section/createSeatingLayout').send({
            name: 'testLayout12',
            capacity: 4,
            dimensions: [ 2 , 2],
            layout: [
                [1, 1],
                [1, 1]
            ], 
            default: true,
            description: 'This is a sample',
            createdBy: prof1.id
        });
        const layout1 = response.body.seatingLayout

        //create a test section
        response = await request.post('/api/section/createSection').send({
            sectionName: 'testSection12',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            maxCapacity: 30,
            seatingArrangement: [
                [null, null, null, null, null],
            ],
            classList: []
        });
        const section1 = response.body.newSection

        //test getting the section view
        response = await request.get("/api/section/getSectionView").query({
            sectionID:section1._id
        });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('testSection12');

        //delete test data
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection12'
        });
        await SeatingLayout.deleteOne({name:'testLayout12'}).exec();
        await request.get("/api/logout");

        done();
    });

    it("Shouldnt reach getSectionView endpoint with invalid section", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        const prof1 = response.body.user

        // Send a section id that doesn't exist
        response = await request.get("/api/section/getSectionView").query({
            sectionID:"123499991234"
        });
        expect(response.status).toBe(500);

        await request.get("/api/logout");

        done();
    });

    
    /********* delete layout tests */

    it("Should reach deleteLayout endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        var prof1 = response.body.user

        //delete layout in case it already exists
        await SeatingLayout.deleteOne({name:'testLayout42'}).exec();

        response = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout42',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1.id
        });
        const layout1 = response.body.seatingLayout


        response = await request.post("/api/section/deleteSeatingLayout").send({
            id: layout1._id 
        });
        expect(response.status).toBe(200);

        await request.get("/api/logout");
        done();
    });

    it("deleteLayout Should not delete a layout which doesnt exist", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        response = await request.post("/api/section/deleteSeatingLayout").send({
            id: "123456789012"
        });
        expect(response.status).toBe(500);

        await request.get("/api/logout");
        done();
    });

    it("deleteLayout Should not delete a layout in use by a section", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        var prof1 = response.body.user

        await SeatingLayout.deleteOne({name:'testLayout42'}).exec();

        response = await request.post("/api/section/createSeatingLayout").send({
            name: 'testLayout42',
            capacity : 1,
            dimension: [1,1],
            layout:[[0]],
            default: false,
            description: 'test',
            createdBy: prof1.id
        });
        const layout1 = response.body.seatingLayout


        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection42'
        });

        response = await request.post("/api/section/createSection").send({
            sectionName: 'testSection42',
            attendanceThreshold: '0',
            seatingLayout: layout1._id,
            attMandatory: false,
            professor: prof1._id,
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });

        response = await request.post("/api/section/deleteSeatingLayout").send({
            id: layout1._id 
        });
        expect(response.status).toBe(418);

        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection42'
        });

        await SeatingLayout.deleteOne({name:'testLayout42'}).exec();

        await request.get("/api/logout");
        done();
    });

})