const app = require('app.js');
const supertest = require("supertest");
const http = require('http');
const mongoose = require('mongoose');
const { User, Course, SeatingLayout } = require('dbSchemas/attendanceSchema.js');

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
        server.close(done);
    });

    it('Should store user to database', async done => {
        var response = await request.delete("/api/delete-user").send({
            email: 'testUser@test.com'
        });
        //Send request to register a user
        var user = await request.post('/api/register').send({
            email: 'testUser@test.com',
            name: 'test user',
            password:'12345',
            is_professor: true
        });

        //Search user in database by email
        user = await User.findOne({
            email: 'testUser@test.com'
        });

        //Check that user information stored in the database is correct
        expect(user.name).toBe('test user');
        expect(user.email).toBe('testUser@test.com')
        expect(user.password).toBe('12345')
        expect(user.is_professor).toBe(true);

        //Delete test user after testing
        response = await request.delete("/api/delete-user").send({
            email: 'testUser@test.com'
        });
        expect(response.status).toBe(200);

        done ()
    });

    it('Should store course & seating layout to database', async done => {
        //Delete test users that may be existing in the database
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection' 
        });

        var response = await request.post("/api/login").send({
            email:'test.professor@unb.ca', 
            password:'testing123'
        });

        //Create 2 students, an admin, and a professor
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
            email: 'admin@test.com',
            name: 'An Admin',
            password:'ad1234min',
            is_professor: true
        });
        const admin1 = response.body.user

        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        response = await request.post('/api/register').send({
            email: 'prof1@test.com',
            name: 'A Professor',
            password:'pr1234of',
            is_professor: true
        });
        const prof1 = response.body.user;

        // Create a sample seating layout for this test
        response = await request.post('/api/section/createSeatingLayout').send({
            name: 'testLayout',
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
            description: 'This is a sample',
            createdBy: prof1._id
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
            maxCapacity: 25,
            seatingArrangement: [
                [null, student1._id, null, null, student2._id],
            ],
            classList: [],
            attendance: [Date.now(), student1._id, false]
        });
        
        //Search course in database by name
        response = await Course.findOne({
            name: 'testSection'
        });
        //course = course.body;

        //Check that course information is stored
        expect(response.name).toBe('testSection');
        expect(JSON.stringify(response.admin)).toBe(JSON.stringify(admin1._id));
        expect(JSON.stringify(response.professor)).toBe(JSON.stringify(prof1._id));
        expect(response.max_capacity).toBe(25);
        expect(response.attendance_threshold).toBe(0);
        expect(JSON.stringify(response.seating_layout)).toBe(JSON.stringify(layout1._id));
        expect(JSON.stringify(response.seating_arrangement)).toBe(JSON.stringify([
            [null, student1._id, null, null, student2._id],
        ]));
        expect(response.always_mandatory).toBe(false);

        response = await SeatingLayout.findOne({
            name: 'testLayout'
        });

        //Check that seating layout is stored
        expect(response.name).toBe('testLayout');
        expect(response.capacity).toBe(25);
        expect(JSON.stringify(response.created_by)).toBe(JSON.stringify(prof1._id));
        expect(JSON.stringify(response.dimensions)).toBe(JSON.stringify([5,5]));
        expect(JSON.stringify(response.layout)).toBe(
            JSON.stringify([
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 1, 1, 1, 0],
                [2, 3, 3, 3, 0]
            ])
        );
        expect(response.default).toBe(true);
        expect(response.description).toBe('This is a sample');

        //Delete sample seating layout after testing
        SeatingLayout.deleteOne({name:'testLayout'}, (err) =>{
            if(err){
                console.log(err);
            }
        });

        //Delete test course after testing
        response = await request.delete("/api/section/deleteSection").send({
            name: 'testSection'
        });
        expect(response.status).toBe(200);
        await request.get("/api/logout");

        //Delete test users after testing
        response = await request.delete("/api/delete-user").send({
            email: 'st1@test.com'
        });

        response = await request.delete("/api/delete-user").send({
            email: 'st2@test.com'
        });

        response = await request.delete("/api/delete-user").send({
            email: 'admin@test.com'
        });
        response = await request.delete("/api/delete-user").send({
            email: 'prof1@test.com'
        });
        expect(response.status).toBe(200);
        done()
    });
})
