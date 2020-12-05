const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const test = require('../global/testFunctions.js');

describe('Dashboard api fuctionality', () => {

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


    describe("Get sections endpoint", () => {

        it("Should reach getSectionView endpoint", async () => {
            response = await request.get("/api/dashboard/getSectionsCreatedByProfessor").query({
                professorID: testData.professor.id
            });
            expect(response.status).toBe(200);
        });

        it("Should reach getSectionsByStudent endpoint", async () => {
            response = await request.get("/api/dashboard/getSectionsByStudent").query({
                studentID: testData.student.id
            });
            expect(response.status).toBe(200);
        });

        it("getSectionsByStudent should give no result when student does not exist", async () => {
            //Send student who doesn't exist
            response = await request.get("/api/dashboard/getSectionsByStudent").query({
                studentID: '999999999999'
            });
            expect(response.status).toBe(200);
            // Returns empty array since student does not have any sections
            expect(response.body).toEqual([]);
        });

        it("getSectionsCreatedByProfessor should give no result when professor does not exist", async () => {
            //Send professor who does not exist
            response = await request.get("/api/dashboard/getSectionsCreatedByProfessor").query({
                professorID: '999999999999'
            });
            expect(response.status).toBe(200);
            // Returns empty array since professor does not have any sections
            expect(response.body).toEqual([]);
        });

    });


    describe("Register for section endpoint", () => {

        // Create & delete a dedicated test section for these tests
        var registerTestSection;
        beforeAll(async() => {
            registerTestSection = await test.createSection({
                professor: testData.professor, 
                seating_layout: testData.layout
            });
        });
        afterAll(async() => await test.deleteSection(registerTestSection.id));

        it("Should be able to register for a section only once", async () => {
            // Should succeed if registering for the first time
            response = await request.put("/api/dashboard/registerForSection").send({
                studentID: testData.student.id,
                sectionName: registerTestSection.name
            });
            expect(response.status).toBe(200);

            // Should fail if you are already registered
            response = await request.put("/api/dashboard/registerForSection").send({
                studentID: testData.student.id,
                sectionName: registerTestSection.name
            });
            expect(response.status).toBe(520);
        });

        it("Should not reach registerForSection endpoint when section doesnt exist", async () => {
            response = await request.put("/api/dashboard/registerForSection").send({
                studentID: testData.student.id,
                sectionName: 'this section does not exist'
            });
            expect(response.status).toBe(530);
        });

    });


    describe("Drop section endpoint", () => {

        // Create & delete a dedicated test section for these tests
        var dropTestSection;
        var dropTestSeatingLayout;
        beforeAll(async() => {
            dropTestSeatingLayout = await test.createSeatingLayout({layout: [[0]]});
            dropTestSection = await test.createSection({
                professor: testData.professor,
                // Test student is registered for this section
                registered_students: [testData.student.id],
                // Test student has a seat
                seating_layout: dropTestSeatingLayout,
                seating_arrangement: [[testData.student.id]]
            });
        });
        afterAll(async() => {
            await test.deleteSection(dropTestSection.id);
            await test.deleteSeatingLayout(dropTestSeatingLayout.id);
        });

        it("Should reach dropSection endpoint", async () => {
            // Drop the section (student is registered)
            response = await request.post("/api/section/dropSection").send({
                studentID: testData.student.id,
                sectionID: dropTestSection.id
            });
            expect(response.status).toBe(200);

            // Check section to make sure it worked as expected
            const updatedSection = await test.getSection(dropTestSection.id);
            // Student should not be in the registered student list
            expect(updatedSection.registered_students.indexOf(testData.student.id)).toBe(-1);
            // Registered student list should have been reduced by 1
            expect(updatedSection.registered_students.length).toBe(0);
            // Student should have lost their seat
            expect(updatedSection.seating_arrangement[0][0]).toBe(null);
            // Seating arrangement & layout should still be the same size
            expect(updatedSection.seating_arrangement.length).toBe(testData.layout.layout.length);
            expect(updatedSection.seating_arrangement[0].length).toBe(testData.layout.layout[0].length);
        });

        it("dropSection should fail when student is not registered for the section", async () => {
            // Drop the section (student is not registered)
            response = await request.post("/api/section/dropSection").send({
                studentID: testData.student.id,
                sectionID: testData.section.id
            });
            expect(response.status).toBe(520);
        });

        it("dropSection should fail when section does not exist", async () => {
            // Try to drop a section that does not exist
            response = await request.post("/api/section/dropSection").send({
                studentID: testData.student.id,
                sectionID: '123456789012'
            });
            expect(response.status).toBe(500);

            await request.get("/api/logout");
        });

    });

})