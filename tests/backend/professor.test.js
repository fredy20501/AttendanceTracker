const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const test = require('../testFunctions.js');

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

    describe("Push attendance endpoint", () => {

        // Create & delete a dedicated test section for these tests
        var attendanceTestSection;
        beforeAll(async() => {
            attendanceTestSection = await test.createSection({
                professor: testData.professor, 
                seating_layout: testData.layout,
                // Test student is registered for this section
                registered_students: [testData.student.id],
                // There is already 1 attendance data where student is absent
                attendance: [{
                    data: Date.now(), 
                    absent_students: [testData.student.id],
                    mandatory: true
                }]
            });
        });
        afterAll(async() => await test.deleteSection(attendanceTestSection.id));

        it("Can get attendance data", async () => {
            response = await request.get("/api/professor/getAttendanceData").query({
                sectionID: attendanceTestSection.id
            });
            expect(response.status).toBe(200);
            expect(response.body.attendanceData[0].absent_students[0]._id).toBe(testData.student.id);
            expect(response.body.attendanceData[0].mandatory).toBe(true);
        });

        it("can push new attendance with an absent student", async () => {
            response = await request.put("/api/professor/pushNewAttendance").send({
                sectionID: attendanceTestSection.id,
                absent_students: [testData.student.id],
                mandatory: false
            });
            expect(response.status).toBe(200);
        });
    
        it("can push new attendance with no absent students", async () => {
            response = await request.put("/api/professor/pushNewAttendance").send({
                sectionID: attendanceTestSection.id,
                absent_students: [],
                mandatory: false
            });
            expect(response.status).toBe(200);
        });

    });
    

    describe("Clear students endpoint", () => {

        // Create & delete a dedicated test section for these tests
        var clearTestSection;
        var clearTestSeatingLayout;
        beforeAll(async() => {
            clearTestSeatingLayout = await test.createSeatingLayout({layout: [[0]]});
            clearTestSection = await test.createSection({
                professor: testData.professor,
                // Test student is registered for this section
                registered_students: [testData.student.id],
                // Test student has a seat
                seating_layout: clearTestSeatingLayout,
                seating_arrangement: [[testData.student.id]]
            });
        });
        afterAll(async() => {
            await test.deleteSection(clearTestSection.id);
            await test.deleteSeatingLayout(clearTestSeatingLayout.id);
        });
        
        it("Should reach clearStudents endpoint", async () => {
            // Clear students
            response = await request.put("/api/professor/clearStudents").send({
                sectionID: clearTestSection.id,
            });
            expect(response.status).toBe(200);

            // Check section to make sure it worked as expected
            const updatedSection = await test.getSection(clearTestSection.id);
            // Registered students should be empty
            expect(updatedSection.registered_students.length).toBe(0);
            // Student should have lost their seat
            expect(updatedSection.seating_arrangement[0][0]).toBe(null);
            // Seating arrangement & layout should still be the same size
            expect(updatedSection.seating_arrangement.length).toBe(testData.layout.layout.length);
            expect(updatedSection.seating_arrangement[0].length).toBe(testData.layout.layout[0].length);
        });


        it("clearStudents should fail when section does not exist", async () => {
            // Try to clear students for a section that doesn't exist
            response = await request.put("/api/professor/clearStudents").send({
                sectionID: '123456789012'
            });
            expect(response.status).toBe(500);
        });

    });


    describe("Archive section endpoint", () => {

        // Create & delete a dedicated test section for these tests
        var archiveTestSection;
        beforeAll(async() => {
            archiveTestSection = await test.createSection({
                professor: testData.professor, 
                seating_layout: testData.layout,
            });
        });
        afterAll(async() => {
            // Delete in both Section and ArchivedSection collections
            await test.deleteSection(archiveTestSection.id);
            await test.deleteArchivedSection(archiveTestSection.id);
        });

        it("Should reach archiveSection endpoint", async () => {
            // Archive section
            response = await request.post("/api/professor/archiveSection").send({
                sectionID: archiveTestSection.id
            });
            expect(response.status).toBe(200);

            // Make sure it is not in the Section collection anymore
            const updatedSection = await test.getSection(archiveTestSection.id);
            expect(updatedSection).toBe(null)
            // Make sure it is now in the ArchivedSection collection
            const archivedSection = await test.getArchivedSection(archiveTestSection.id);
            expect(archivedSection).not.toBe(null);
        });


        it("archiveSection should fail when section does not exist", async () => {
            // Try to archive a section that does not exist
            response = await request.post("/api/professor/archiveSection").send({
                sectionID: '123456789012'
            });
            expect(response.status).toBe(500);
        });

    });

})