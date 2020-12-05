const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');
const test = require('../testFunctions.js');

describe('Backend server fuctionality', () => {

    var server;
    var request;
    var testUserID;
    var response;

    beforeAll(async (done) => {
        //Open server & database before running tests
        server = http.createServer(app);
        server.listen();
        request = supertest(server);
        const db = mongoose.connection;
        db.once('open', done);
    });

    afterAll(async (done) => {
        // Delete test user
        if (testUserID) await test.deleteUser(testUserID);

        //Close server & database connection when done
        await mongoose.connection.close();
        server.close(done);
    });

    it('can reach server api', async () => {
        response = await request.get("/");
        expect(response.status).toBe(200);
    });

    it('can send invalid login', async () => {
        response = await request.post("/api/login").send({
            email:'blah', 
            password:'bbbbbb'
        });
        // expect 401 since user should not exist
        expect(response.status).toBe(401);
    });

    it('can not allow access to data without being logged in', async () => {
        response = await request.get("/api/secret-api");
        expect(response.status).toBe(401);
    });

    it('can successfully create, login, logout, and delete test account', async () =>{
        // Create test user
        const password = test.uniqueID();
        const userName = '*test_user'+password;
        const email = userName+'@unb.ca';
        response = await request.post("/api/register").send({
            name: userName, 
            email: email,
            password: password,
            is_professor: false
        });
        testUserID = response.body.user._id;
        expect(response.status).toBe(200);

        // Log in
        response = await request.post("/api/login").send({
            email: email, 
            password: password
        });
        expect(response.status).toBe(200);

        // Delete test account
        response = await request.delete("/api/delete-user").send({
            email: email
        });
        expect(response.status).toBe(200);

        // Logout
        response = await request.get("/api/logout");
        expect(response.status).toBe(200);

        // Note: the test user is also deleted in the afterAll() function
        // in case the test fails and it is not deleted
    });

})