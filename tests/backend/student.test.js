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

    describe("Update student seat endpoint", () => {

        // Create & delete dedicated test data for these tests
        var seatTestSection;
        var seatTestSection2;
        var seatTestLayout;
        beforeAll(async() => {
            seatTestLayout = await test.createSeatingLayout({
                layout: [
                    [2,2,2,2],
                    [3,3,3,3],
                    [2,2,2,0],
                ]
            });
            seatTestSection = await test.createSection({
                professor: testData.professor, 
                seating_layout: seatTestLayout,
                registered_students: [testData.student.id],
                seating_arrangement: [
                    [null, null, null, null],
                    [null, null, null, testData.student.id],
                    [null, null, null, null],
                ]
            });
            seatTestSection2 = await test.createSection({
                professor: testData.professor, 
                seating_layout: testData.layout
            });
        });
        afterAll(async() => {
            await test.deleteSection(seatTestSection.id);
            await test.deleteSection(seatTestSection2.id);
            await test.deleteSeatingLayout(seatTestLayout.id);
        });

        it('Should reach updateStudentSectionView endpoint', async () => {
            // Update the seating arrangement
            response = await request.put("/api/student/updateStudentSectionView").send({
                sectionID: seatTestSection.id,
                seatingArrangement: [
                    [null, null, testData.student.id, null],
                    [null, null, null, null],
                    [null, null, null, null],
                ]
            });
            expect(response.status).toBe(200);

            // Check if seating arrangement was updated
            const updatedSection = await test.getSection(seatTestSection.id);
            expect(updatedSection.seating_arrangement[0][2].toString()).toBe(testData.student.id);
            expect(updatedSection.seating_arrangement[1][3]).toBe(null);
        });

        it('updateStudentSectionView should not update if given invalid seating arrangement', async () => {
            // Try to update the seating arrangement with an invalid seating arrangement:

            // -> Empty array
            response = await request.put("/api/student/updateStudentSectionView").send({
                sectionID: seatTestSection2.id,
                seatingArrangement: []
            });
            expect(response.status).toBe(400);
            
            // -> No seating arrangement
            response = await request.put("/api/student/updateStudentSectionView").send({
                sectionID: seatTestSection2.id
            });
            expect(response.status).toBe(400);

            // -> Wrong size seating arrangement
            response = await request.put("/api/student/updateStudentSectionView").send({
                sectionID: seatTestSection2.id,
                seatingArrangement: [
                    [null, null, '123456789012', null],
                ]
            });
            expect(response.status).toBe(400);
        });


        it('updateStudentSectionView should fail if section does not exist', async () => {
            // Update the seating arrangement
            response = await request.put("/api/student/updateStudentSectionView").send({
                sectionID: '123456789012',
                seatingArrangement: [
                    [null, null, '123456789012', null]
                ]
            });
            expect(response.status).toBe(500);
        });

    });

})