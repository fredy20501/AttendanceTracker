const app = require('app.js');
const mongoose = require('mongoose');
const test = require('./testFunctions.js');
const { User, Section, ArchivedSection, SeatingLayout } = require('dbSchemas/attendanceSchema.js');

describe('Make sure tests clean up their data', () => {
    
    // Number of minutes to check for new test data
    var minutes = 2;
    var fewMinutesAgo = (new Date()).setMinutes((new Date()).getMinutes()-minutes);

    beforeAll(async (done) => {
        // Note that we need to import app.js since it opens the database connection
        app;

        // Wait for database to open before running tests
        const db = mongoose.connection;
        db.once('open', done);
    });

    afterAll(async () => {
        // Close database connection when done
        await mongoose.connection.close();
    });

    /* ==================================================================== */
    // UNCOMMENT THIS TEST (change 'xit' to 'it') AND RUN IT >>ONCE<< 
    // TO MANUALLY CLEAN THE DATABASE. DO NOT LEAVE THIS TEST UNCOMMENTED!
    it("remove all test data from the database", async () => {
        await test.clearAllTestData();
    });
    /* ==================================================================== */

    it("database should not have new test users created in the last "+minutes+" minutes", async () => {
        const users = await User.find({
            name: /^\*test_/,
            createdAt: {$gte: fewMinutesAgo}
        }).exec();
        expect(users.length).toBe(0);
    });

    it("database should not have new test sections created in the last "+minutes+" minutes", async () => {
        const sections = await Section.find({
            name: /^\*test_/,
            createdAt: {$gte: fewMinutesAgo}
        }).exec();
        expect(sections.length).toBe(0);
    });

    it("database should not have new test layouts created in the last "+minutes+" minutes", async () => {
        const layouts = await SeatingLayout.find({
            name: /^\*test_/,
            createdAt: {$gte: fewMinutesAgo}
        }).exec();
        expect(layouts.length).toBe(0);
    });

    it("database should not have new test archived sections created in the last "+minutes+" minutes", async () => {
        const archivedSections = await ArchivedSection.find({
            name: /^\*test_/,
            createdAt: {$gte: fewMinutesAgo}
        }).exec();
        expect(archivedSections.length).toBe(0);
    });

});