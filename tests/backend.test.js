const app = require('../server/app.js');
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

    //Close server & database when done
    afterAll(async (done) => {
        await mongoose.connection.close();
        await server.close(done);
    });

    it('Should reach server api', async done => {
        const response = await request.get("/");
        expect(response.status).toBe(200);
        done();
    });

    it('Should send invalid login', async done => {
        const response = await request.post("/api/login").send({
            email:'blah', 
            password:'bbbbbb'
        });
        // expect 401 since user should not exist
        expect(response.status).toBe(401);
        done();
    });

    it('Should not allow access to data without being logged in', async done => {
        const response = await request.get("/api/dashboard");
        expect(response.status).toBe(401);
        done();
    });

    xit('Should successfully create, login, logout, and delete test account', async done =>{
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

    xit("Should reach create-section endpoint", async done => {
        response = await request.get("/api/createSection");
        expect(response.status).toBe(200);
        done()
    });

    xit("Should reach update-section endpoint", async done => {
        response = await request.get("/api/updateSection");
        expect(response.status).toBe(200);
        done();
    });

    xit("Should reach delete-section endpoint", async done => {
        response = await request.get("/api/deleteSection");
        expect(response.status).toBe(200);
        done();
    });

    xit("Should reach create-seating-plan endpoint", async done => {
        response = await request.get("/api/createSeatingLayout");
        expect(response.status).toBe(200);
        done()
    });

    xit("Should reach update-seating-plan endpoint", async done => {
        response = await request.get("/api/updateSeatingLayout");
        expect(response.status).toBe(200);
        done();
    });

    xit("Should reach delete-seating-plan endpoint", async done => {
        response = await request.get("/api/deleteSeatingLayout");
        expect(response.status).toBe(200);
        done();
    });
})