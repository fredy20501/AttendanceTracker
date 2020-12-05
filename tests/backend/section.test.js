const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const test = require('../global/testFunctions.js');

describe('Backend server fuctionality', () => {
    
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


    describe("Create & Delete seating layout endpoints", () => {

        // Delete the seating layout after the test
        var testSeatingLayoutID;
        afterAll(async() => {
            if (testSeatingLayoutID) await test.deleteSeatingLayout(testSeatingLayoutID);
        });

        it("Should reach createSeatingLayout and deleteSeatingLayout endpoints", async () => {
            //create a test layout
            response = await request.post("/api/section/createSeatingLayout").send({
                name: '*test_layout'+test.uniqueID(),
                capacity : 1,
                dimension: [1,1],
                layout:[[0]],
                default: true,
                description: 'test',
                createdBy: testData.professor.id
            });
            testSeatingLayoutID = response.body.seatingLayout._id;
            expect(response.status).toBe(200);
        });

    });

    describe("Create section endpoint", () => {
        // Delete the section after the test
        var testCreateSectionID;
        afterAll(async() => {
            if (testCreateSectionID) await test.deleteSection(testCreateSectionID);
        });
            
        it("Should reach createSection endpoint", async () => {
            response = await request.post("/api/section/createSection").send({
                sectionName: '*test_section'+test.uniqueID(),
                attendanceThreshold: '0',
                seatingLayout: testData.layout.id,
                attMandatory: false,
                professor: testData.professor.id,
                students: [],
                maxCapacity: 30,
                seatingArrangement: [] 
            });
            testCreateSectionID = response.body.newSection._id;
            expect(response.status).toBe(200);
        });

    });

    
    describe("Update section endpoint", () => {
        // Create & delete a dedicated test section & layout for these tests
        var updateTestSection;
        var testSeatingLayout;
        beforeAll(async() => {
            updateTestSection = await test.createSection({
                professor: testData.professor, 
                seating_layout: testData.layout
            });
            testSeatingLayout = await test.createSeatingLayout();
        });
        afterAll(async() => {
            await test.deleteSection(updateTestSection.id);
            await test.deleteSeatingLayout(testSeatingLayout.id);
        });

        it("Should reach updateSection endpoint", async () => {
            const newName = '*test_section'+test.uniqueID();
            const classList = [
                {name: 'test1', email:'test1@unb.ca'},
                {name: 'test2', email:'test2@unb.ca'},
                {name: 'test3', email:'test3@unb.ca'},
            ];
            response = await request.put("/api/section/updateSection").send({
                sectionId: updateTestSection.id,
                sectionName: newName, // Change the name
                attendanceThreshold: 27,
                seatingLayout: testSeatingLayout.id, // Change the layout
                attMandatory: false,
                professor: testData.professor.id,
                students: [],
                maxCapacity: 130,
                classList: classList,
                seatingArrangement: [] 
            });
            expect(response.status).toBe(200);

            // Check section to make sure it worked as expected
            const updatedSection = await test.getSection(updateTestSection.id);
            // Name should have changed
            expect(updatedSection.name).toBe(newName);
            // Seating layout should have changed
            expect(updatedSection.seating_layout.toString()).toBe(testSeatingLayout.id);
            // Max capacity should have changed
            expect(updatedSection.max_capacity).toBe(130);
            // Attendance threshold should have changed
            expect(updatedSection.attendance_threshold).toBe(27);
            // Class list should have changed (check parts of it)
            expect(updatedSection.class_list[1].name).toBe(classList[1].name);
            expect(updatedSection.class_list[2].email).toBe(classList[2].email);
        });

    });


    describe("Delete section endpoint", () => {

        // Create a dedicated test section for this test
        var deleteTestSection;
        beforeAll(async() => {
            deleteTestSection = await test.createSection({
                professor: testData.professor, 
                seating_layout: testData.layout
            });
        });
        // Delete it afterwards in case the test failed
        afterAll(async() => await test.deleteSection(deleteTestSection.id));

        it("Should reach deleteSection endpoint", async () => {
            response = await request.delete("/api/section/deleteSection").send({
                name: deleteTestSection.name
            });
            expect(response.status).toBe(200);
        });

    });


    describe("Get seating layouts endpoint", () => {

        it("Should reach previousSeatingPlans endpoint (and it should be an array)", async () => {
            response = await request.get("/api/section/previousSeatingPlans");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.seatingLayout)).toBe(true);
        });

    })
    

    describe("Get section details endpoint", () => {

        it("Should reach getSectionView endpoint", async () => {
            response = await request.get("/api/section/getSectionView").query({
                sectionID: testData.section.id
            });
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(testData.section.name);
        });
    
        it("Shouldn't reach getSectionView endpoint with invalid section", async () => {
            // Send a section id that doesn't exist
            response = await request.get("/api/section/getSectionView").query({
                sectionID:"123499991234"
            });
            expect(response.status).toBe(500);
        });
    
    });
    
    
    describe("Delete layout enpoint", () => {

        // Create & delete dedicated test data for these tests
        var deleteTestLayout;
        var usedTestLayout;
        var usedTestSection;
        beforeAll(async() => {
            deleteTestLayout = await test.createSeatingLayout();
            usedTestLayout = await test.createSeatingLayout();
            usedTestSection = await test.createSection({
                professor: testData.professor,
                // usedTestLayout is used by a section
                seating_layout: usedTestLayout
            });
        });
        afterAll(async() => {
            await test.deleteSection(usedTestSection.id);
            await test.deleteSeatingLayout(usedTestLayout.id);
            await test.deleteSeatingLayout(deleteTestLayout.id);
        });

        it("Should reach deleteLayout endpoint", async () => {
            response = await request.post("/api/section/deleteSeatingLayout").send({
                id: deleteTestLayout.id 
            });
            expect(response.status).toBe(200);
        });
    
        it("deleteLayout Should not delete a layout which doesnt exist", async () => {
            response = await request.post("/api/section/deleteSeatingLayout").send({
                id: "123456789012"
            });
            expect(response.status).toBe(500);
        });
    
        it("deleteLayout Should not delete a layout in use by a section", async () => {
            response = await request.post("/api/section/deleteSeatingLayout").send({
                id: usedTestLayout.id 
            });
            // Status 418 means the layout is used by a section
            expect(response.status).toBe(418);
        });

    });

})