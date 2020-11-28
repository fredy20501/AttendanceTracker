const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const { SeatingLayout } = require('dbSchemas/attendanceSchema.js');

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


    it('Should reach updateStudentSectionView endpoint', async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        
        // Make sure testing objects don't already exist
        await request.delete("/api/delete-user").send({email: 'prof1@test.com'});
        await request.delete("/api/section/deleteSection").send({name: 'testSection'});
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        
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
            layout:[
                [2,0,2,2],
                [2,0,2,2],
                [2,0,2,2],
            ],
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
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        const section1 = response.body.newSection

        // Update the seating arrangement
        response = await request.put("/api/student/updateStudentSectionView").send({
            sectionID: section1._id,
            seatingArrangement: [
                [null, null, '123456789012', null],
                ['123456789013', null, '123456789014', null],
                ['123456789015', null, '123456789016', null],
            ]
        });
        expect(response.status).toBe(200);

        //delete testing objects
        await request.delete("/api/delete-user").send({email: 'prof1@test.com'});
        await request.delete("/api/section/deleteSection").send({name: 'testSection'});
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        await request.get("/api/logout");
        done();
    });


    it('updateStudentSectionView should not update if given invalid seating arrangement', async done => {
        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });
        
        // Make sure testing objects don't already exist
        await request.delete("/api/delete-user").send({email: 'prof1@test.com'});
        await request.delete("/api/section/deleteSection").send({name: 'testSection'});
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();
        
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
            layout:[
                [2,0,2,2],
                [2,0,2,2],
                [2,0,2,2],
            ],
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
            students: [],
            maxCapacity: 30,
            seatingArrangement: [] 
        });
        const section1 = response.body.newSection

        // Try to update the seating arrangement with an invalid seating arrangement:

        // -> Empty array
        response = await request.put("/api/student/updateStudentSectionView").send({
            sectionID: section1._id,
            seatingArrangement: []
        });
        expect(response.status).toBe(400);
        
        // -> No seating arrangement
        response = await request.put("/api/student/updateStudentSectionView").send({
            sectionID: section1._id
        });
        expect(response.status).toBe(400);

        // -> Wrong size seating arrangement
        response = await request.put("/api/student/updateStudentSectionView").send({
            sectionID: section1._id,
            seatingArrangement: [
                [null, null, '123456789012', null],
            ]
        });
        expect(response.status).toBe(400);



        //delete testing objects
        await request.delete("/api/delete-user").send({email: 'prof1@test.com'});
        await request.delete("/api/section/deleteSection").send({name: 'testSection'});
        await SeatingLayout.deleteOne({name:'testLayout'}).exec();

        await request.get("/api/logout");
        done();
    });


    it('updateStudentSectionView should fail if section does not exist', async done => {
        var response;
        
        // Update the seating arrangement
        response = await request.put("/api/student/updateStudentSectionView").send({
            sectionID: '123456789012',
            seatingArrangement: [
                [null, null, '123456789012', null]
            ]
        });
        expect(response.status).toBe(500);

        await request.get("/api/logout");
        done();
    });

})