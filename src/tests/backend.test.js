const app = require('../../server/index.js');
const supertest = require("supertest");
const request = supertest(app);

describe('Sample Test', () => {
    it('Should test that true === true', () => {
        expect(true).toBe(true);
    })
})

describe('Backend server fuctionality', () => {
    it('reaches server', async done =>{
        //tests to see if server is reachable
        const response = await request.get("/");
        expect(response.status).toBe(200);
        //expect(response.body.message).toBe("Hellow, World!");
        done();
    })
    it('try to access data without being logged in', async done =>{
        //sends GET request to /dashboard endpoint
        const response = await request.get("/api/dashboard");
        // expect 401 unauthorized since we are not logged in
        expect(response.status).toBe(401);
        done();
    })
})