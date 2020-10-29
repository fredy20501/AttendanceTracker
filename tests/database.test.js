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
        //Send request to register a user
        var user = await request.post('/api/register').send({
            email: 'dummy@test.com',
            name: 'dummy test',
            password:'12345',
            is_professor: true
        });

        //Search user in database by email
        user = await User.findOne({
            email: 'dummy@test.com'
        });

        //Check that user information stored in the database is correct
        expect(user.name).toBe('dummy test');
        expect(user.email).toBe('dummy@test.com')
        expect(user.password).toBe('12345')
        expect(user.is_professor).toBe(true);

        //Delete test user after testing
        const response = await request.delete("/api/delete-user").send({
            email: 'dummy@test.com'
        });
        expect(response.status).toBe(200);

        done ()
    });

    it('Should store course to database', async done => {

        //Create 2 students, an admin, and a professor
        const student1 = await request.post('/api/register').send({
            email: 'st1@test.com',
            name: 'Student 1',
            password:'st1234',
            is_professor: false
        });
        const student2 = await request.post('/api/register').send({
            email: 'st2@test.com',
            name: 'Student 2',
            password:'st2345',
            is_professor: false
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

        // Create a sample seating layout for this test
        const seatingLayout = await request.post('/api/createSeatingLayout').send({
            name: 'Sample layout',
            createdBy: prof1,
            capacity: 25,
            dimensions: [ 5 , 5],
            layout: [
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 3, 3, 3, 0]
            ], 
            default: true,
            description: 'This is a sample'
        });

        //Create test course
        var course = await request.post('/api/createSection').send({
            courseName: 'SWE4103',
            admin: admin1,
            professor: prof1,
            maxCapacity: 30,
            attendance: [Date, [student2], true],
            seatingLayout: seatingLayout,
            attendanceThreshold: 0,
            seatingArrangement: [
                [2, student1, 1, 1, 0],
            ],
            attMandatory: true,
        });
        
        //Search course in database by name
        course = await Course.findOne({
            name: 'SWE4103'
        });

        //Check that course information is stored
        expect(course.name).toBe('SWE4103');
        expect(course.admin).toBe(admin1);
        expect(course.professor).toBe(prof1);
        expect(course.maxCapacity).toBe(30);
        expect(course.attendance).toBe([Date, [student2], true]);
        expect(course.seating_layout).toBe(SeatingLayout);
        expect(course.seating_arrangement).toBe([
            [2, student1, 1, 1, 0],
        ]);
        expect(course.always_mandatory).toBe(true);

        //Delete sample seating layout after testing
        var response = await request.delete("/api/deleteSeatingLayout").send({
            name: 'Sample layout'
        });
        expect(response.status).toBe(200);

        //Delete test course after testing
        response = await request.delete("/api/deleteSection").send({
            name: 'SWE4103'
        });
        expect(response.status).toBe(200);

        //Delete test users after testing
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        expect(response.status).toBe(200);

        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        expect(response.status).toBe(200);

        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        expect(response.status).toBe(200);

        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        expect(response.status).toBe(200);

        done()
    });

    it('Should store seating layout to database', async done => {

        // Create a test seating layout
        var seatingLayout = await request.post('/api/createSeatingLayout').send({
            name: 'Sample layout',
            capacity: 25,
            dimensions: [ 5 , 5],
            layout: [
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 3, 3, 3, 0]
            ], 
            default: true,
            description: 'This is a sample'
        });
        
        //Search layout in database by name
        seatingLayout = await SeatingLayout.findOne({
            name: 'Sample layout'
        });

        //Check that seating layout information is stored
        expect(seatingLayout.name).toBe('Simple layout');
        expect(seatingLayout.capacity).toBe(25);
        expect(seatingLayout.dimensions).toBe([5,5]);
        expect(seatingLayout.layout).toBe([ [2, 1, 1, 1, 0],
                                            [2, 1, 1, 1, 0],
                                            [2, 1, 1, 1, 0],
                                            [2, 1, 1, 1, 0],
                                            [2, 3, 3, 3, 0] ]);
        expect(seatingLayout.default).toBe(true);
        expect(seatingLayout.description).toBe('This is a sample');

        //Delete test layout after testing
        const response = await request.delete("/api/deleteSeatingLayout").send({
            name: 'Sample layout'
        });
        expect(response.status).toBe(200);
        
        done()
    })

})
