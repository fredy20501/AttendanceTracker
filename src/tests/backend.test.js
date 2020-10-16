const app = require('../../server/app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');

describe('Sample Test', () => {
    it('Should test that true === true', () => {
        expect(true).toBe(true);
    })
})

describe('Backend server fuctionality', () => {
    let server;
    let request;

    // Open server before running tests
    beforeAll((done) => {
        server = http.createServer(app);
        server.listen(done);
        request = supertest(server);
    });

    // Close database & server when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });

    it('reaches server api', async done =>{
        // tests to see if api is reachable
        const response = await request.get("/");
        expect(response.status).toBe(200);
        done();
    });

    it('send invalid login', async done =>{
        const response = await request.post("/api/login").send({
            email:'blah', 
            password:'bbbbbb'
        });
        // expect 404 since user should not exist
        expect(response.status).toBe(404);
        done();
    });

    it('try to access data without being logged in', async done =>{
        const response = await request.get("/api/dashboard");
        // expect 401 unauthorized since we are not logged in
        expect(response.status).toBe(401);
        done();
    });

    it('create, login, logout, then delete test account', async done =>{
        // Create test account
        var response = await request.post("/api/register").send({
            name:'test_user', 
            email:'123test@test456.com', 
            password:'12345',
            is_professor: false
        });
        expect(response.status).toBe(200);

        // Login
        response = await request.post("/api/login").send({
            email:'123test@test456.com', 
            password:'12345'
        });
        expect(response.status).toBe(200);

        // Logout
        response = await request.get("/api/logout");
        expect(response.status).toBe(200);

        // Delete test account
        response = await request.delete("/api/delete-user").send({
            email: '123test@test456.com'
        });
        expect(response.status).toBe(200);

        done();
    });
})