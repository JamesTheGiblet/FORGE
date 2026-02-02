const request = require('supertest');
const app = require('../src/index'); // Ensure this path matches your structure

describe('Server Endpoints', () => {
    let server;

    // Prevent port conflicts during tests if app.listen is called on require
    beforeAll(() => {
        // If app.listen is wrapped in a conditional check in index.js, this isn't needed.
        // Otherwise, we might need to handle the open handle.
    });

    it('GET /health should return 200 OK', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
    });

    it('GET / should return welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Server is running');
    });

    it('GET /unknown should return 404', async () => {
        const res = await request(app).get('/unknown-route');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Route not found');
    });
});
