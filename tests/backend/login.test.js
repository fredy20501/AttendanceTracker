const app = require('app.js');
const mongoose = require('mongoose');
const supertest = require("supertest");
const http = require('http');

describe('Backend server fuctionality', () => {

    let server;
    let request;

    //Open server & database before running tests
    beforeAll(async (done) => {
        server = http.createServer(app);
        server.listen();
        request = supertest(server);
        const db = mongoose.connection;
        db.once('open', done);
    });

    //Close server & database after running tests
    afterAll(async (done) => {
        await mongoose.connection.close();
        server.close(done);
    });

    it('can reach server api', async done => {
        const response = await request.get("/");
        expect(response.status).toBe(200);
        done();
    });

    it('can send invalid login', async done => {
        const response = await request.post("/api/login").send({
            email:'blah', 
            password:'bbbbbb'
        });
        // expect 401 since user should not exist
        expect(response.status).toBe(401);
        done();
    });

    it('can not allow access to data without being logged in', async done => {
        const response = await request.get("/api/secret-api");
        expect(response.status).toBe(401);
        done();
    });

    it('can successfully create, login, logout, and delete test account', async done =>{
        // Delete test account (if it exists)
        response = await request.delete("/api/delete-user").send({
            email: '123test@test456.com'
        });
        
        // Create test account
        var response = await request.post("/api/register").send({
            name:'test_user', 
            email:'123test@test456.com', 
            password:'12345',
            is_professor: false
        });
        expect(response.status).toBe(200);

        // Log in
        response = await request.post("/api/login").send({
            email:'123test@test456.com', 
            password:'12345'
        });
        expect(response.status).toBe(200);

        // Delete test account
        response = await request.delete("/api/delete-user").send({
            email: '123test@test456.com'
        });
        expect(response.status).toBe(200);

        // Logout
        response = await request.get("/api/logout");
        expect(response.status).toBe(200);

        done();
    });

})