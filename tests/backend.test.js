const app = require('..');
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
    it('gets login endpoint', async done =>{
        //sends GET request to /login endpoint
        const response = await request.get("/login");
        expect(response.status).toBe(200);
        done();
    })
})