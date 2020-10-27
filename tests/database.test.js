const app = require('../server/app.js');
const supertest = require("supertest");
const http = require('http');
const mongoose = require('mongoose');
const { User, Course, SeatingLayout } = require('../server/dbSchemas/attendanceSchema.js');

describe('Database Functionality', () => {

    let request;
    let server;

    // Open database before running tests
    beforeAll(async (done) => {
        server = http.createServer(app);
        server.listen();
        request = supertest(server);
        const db = mongoose.connection;
        db.once('open', done);
    });

    // Close database & server when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        await server.close(done);
    });

    it('Should store user to database', async done => {
        //Send request to register user
        const res = await request.post('/api/register').send({
            email: 'dummy@test.com',
            name: 'dummy test',
            password:'12345',
            is_professor: true
        });

        //Search user in database by email
        const user = await User.findOne({
            email: 'dummy@test.com'
        });

        //Check that user has name, email, password, and is or is not a professor
        expect(user.name).toBeTruthy()
        expect(user.email).toBeTruthy()
        expect(user.password).toBeTruthy()
        expect(typeof(user.is_professor) === 'boolean').toBeTruthy();

        //Delete test user after testing
        response = await request.delete("/api/delete-user").send({
            email: 'dummy@test.com'
        });

        done ()
    });

    xit('Should store course to database', async done => {

        // Create a sample seating layout for this test
        const seatingLayout = await request.post('/api/createSeatingLayout').send({
            name: 'Sample layout',
            capacity: 25,
            dimensions: [ 5 , 5],
            layout: [[5]], 
            default: true,
            description: 'This is a sample'
        });

        //Create test course
        const res = await request.post('/api/createSection').send({
            name: 'SWE4103',
            admin: 'Dr. MacIsaac',
            professor: 'Dawn MacIsaac',
            maxCapacity: 30,
            attendance: [Date, [], true],
            seating_layout: seatingLayout,
            seating_arrangement: [[]],
            always_mandatory: true,
        });
        
        //Search course in database by name
        const course = await Course.findOne({
            name: 'SWE4103'
        });

        //Check that course information is stored
        expect(course.name).toBeTruthy();
        expect(course.admin).toBeTruthy();
        expect(course.professor).toBeTruthy();
        expect(course.students).toBeTruthy();
        expect(course.maxCapacity).toBeTruthy();
        expect(course.attendance).toBeTruthy();
        expect(course.date_created).toBeTruthy();

        //Delete sample seating layout after testing
        response = await request.delete("/api/deleteSeatingLayout").send({
            name: 'Sample layout'
        });

        //Delete test course after testing
        response = await request.delete("/api/deleteSection").send({
            name: 'SWE4103'
        });

        done();
    });

    xit('Should store seating layout to database', async done => {

        // Create a test seating layout
        const response = await request.post('/api/createSeatingLayout').send({
            name: 'Sample layout',
            capacity: 25,
            dimensions: [ 5 , 5],
            layout: [[5]], 
            default: true,
            description: 'This is a sample'
        });
        
        //Search layout in database by name
        const seatingLayout = await SeatingLayout.findOne({
            name: 'Sample layout'
        });

        //Check that seating layout information is stored
        expect(seatingLayout.name).toBeTruthy();
        expect(seatingLayout.capacity).toBeTruthy();
        expect(seatingLayout.dimensions).toBeTruthy();
        expect(seatingLayout.layout).toBeTruthy();
        expect(seatingLayout.default).toBeTruthy();
        expect(seatingLayout.description).toBeTruthy();

        //Delete test layout after testing
        response = await request.delete("/api/deleteSeatingLayout").send({
            name: 'Sample layout'
        });
        
        done()
    })

})
