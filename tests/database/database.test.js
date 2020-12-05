const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const test = require('../testFunctions.js');
const { User, Section, SeatingLayout } = require('dbSchemas/attendanceSchema.js');

describe('Database Functionality', () => {

    var server;
    var request;
    var testData;
    var response;

    beforeAll(async (done) => {
        //Open server & database before running tests
        server = http.createServer(app);
        server.listen();
        request = supertest(server);
        const db = mongoose.connection;
        db.once('open', async function() {
            // Create test data
            testData = await test.createTestData();
            // Login once before all tests
            await test.login(request, testData.professor);

            done();
        });
    });

    afterAll(async (done) => {
        // Logout once after all tests
        await test.logout(request);
        // Delete test data
        await test.deleteTestData(testData);

        //Close server & database connection when done
        await mongoose.connection.close();
        server.close(done);
    });

    describe("Register user", () => {

        // Delete test user after the test
        var testUserID;
        afterAll(async() => {
           if (testUserID) await test.deleteUser(testUserID);
        });

        it('Should store user to database', async () => {
            //Send request to register a user
            const userName = '*test_user'+test.uniqueID();
            const email = userName+'@test.com';
            const password = '12345';
            var user = await request.post('/api/register').send({
                email: email,
                name: userName,
                password: password,
                is_professor: true
            });
            testUserID = user.id;
    
            //Search user in database by email
            const updatedUser = await User.findOne({email: email});
    
            //Check that user information stored in the database is correct
            expect(updatedUser.name).toBe(userName);
            expect(updatedUser.email).toBe(email)
            expect(updatedUser.password).toBe(password)
            expect(updatedUser.is_professor).toBe(true);
    
            // Note: the test user is deleted in the afterAll() function
        });

    });
    

    describe("Store section & seating layout", () => {
        
        // Delete test data after the test
        var testLayoutID;
        var testSectionID;
        afterAll(async() => {
           if (testLayoutID) await test.deleteSeatingLayout(testLayoutID);
           if (testSectionID) await test.deleteSection(testSectionID);
        });

        it('Should store section & seating layout to database', async () => {
            // Create a sample seating layout for this test
            const layoutName = '*test_layout'+test.uniqueID();
            const layout = [
                [2, 1, 1, 1, 0]
            ];
            response = await request.post('/api/section/createSeatingLayout').send({
                name: layoutName,
                capacity: 25,
                dimensions: [5 , 5],
                layout: layout,
                default: true,
                description: 'This is a sample',
                createdBy: testData.professor.id
            });
            const layout1 = response.body.seatingLayout
    
            //Create test section
            const sectionName = '*test_section'+test.uniqueID();
            const seatingArrangement = [
                [null, testData.student.id, null, null, null]
            ];
            response = await request.post('/api/section/createSection').send({
                sectionName: sectionName,
                attendanceThreshold: '0',
                seatingLayout: layout1._id,
                attMandatory: false,
                professor: testData.professor.id,
                maxCapacity: 25,
                seatingArrangement: seatingArrangement,
                classList: []
            });
            
            //Get the section in database by name
            const updatedSection = await Section.findOne({name: sectionName});
    
            //Check that section information is stored
            expect(updatedSection.name).toBe(sectionName);
            expect(updatedSection.professor.toString()).toBe(testData.professor.id);
            expect(updatedSection.max_capacity).toBe(25);
            expect(updatedSection.attendance_threshold).toBe(0);
            expect(JSON.stringify(updatedSection.seating_layout)).toBe(JSON.stringify(layout1._id));
            expect(JSON.stringify(updatedSection.seating_arrangement)).toBe(JSON.stringify(seatingArrangement));
            expect(updatedSection.always_mandatory).toBe(false);
    
            //Get the seating layout in database by name
            const updatedLayout = await SeatingLayout.findOne({name: layoutName});
            //Check that seating layout information is stored
            expect(updatedLayout.name).toBe(layoutName);
            expect(updatedLayout.capacity).toBe(25);
            expect(updatedLayout.created_by.toString()).toBe(testData.professor.id);
            expect(JSON.stringify(updatedLayout.dimensions)).toBe(JSON.stringify([5,5]));
            expect(JSON.stringify(updatedLayout.layout)).toBe(JSON.stringify(layout));
            expect(updatedLayout.default).toBe(true);
            expect(updatedLayout.description).toBe('This is a sample');
    
            // Note: the section & seating layout are deleted in the afterAll() function
        });

    });

})


