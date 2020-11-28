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

    //Close server & database when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
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

        // Delete layout
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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

        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
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
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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

    //********* delete layout tests */

    it("Should reach deleteLayout endpoint", async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        var prof1 = response.body.user

        //delete just in case
        SeatingLayout.deleteOne({name:'testLayout42'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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

        //delete just in case
        SeatingLayout.deleteOne({name:'testLayout42'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

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

        SeatingLayout.deleteOne({name:'testLayout42'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

        await request.get("/api/logout");
        done();
    });


})