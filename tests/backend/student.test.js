const app = require('app.js');
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
        db.once('open', function() {

            done();
        });
    });

    //Close server & database when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });
    it('Should reach updateStudentCourseView endpoint', async done => {
        var response;
        
        // Make sure testing objects don't already exist
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });
        
        // Create testing prof, layout, and section
        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user

        response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

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
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        const section1 = response.body.newSection

        // Update the seating arrangement
        response = await request.put("/api/student/updateStudentCourseView").send({
            courseID: section1._id,
            seatingArrangement: [
                [null, null, '123456789012', null],
                ['123456789013', null, '123456789014', null],
                ['123456789015', null, '123456789016', null],
            ]
        });
        expect(response.status).toBe(200);

        await request.get("/api/logout");

        //delete testing objects
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        response = await request.delete("/api/section/deleteSeatingLayout").send({
            name: 'testLayout' 
        });

        done();
    })

})