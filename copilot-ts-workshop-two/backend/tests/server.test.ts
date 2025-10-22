import request from 'supertest';
import app from '../src/server';

process.env.TEST_PORT = '3002'; // Set the test port

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should return all superheroes as an array', async () => {
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Check that required fields exist
    response.body.forEach(hero => {
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name');
      expect(hero).toHaveProperty('image');
      expect(hero).toHaveProperty('powerstats');
    });
  });

  it('should handle internal server error gracefully', async () => {
    // Temporarily mock loadSuperheroes to throw
    const original = app._router.stack.find(r => r.route && r.route.path === '/api/superheroes').route.stack[0].handle;
    app._router.stack.find(r => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = async (req, res) => {
      res.status(500).send('Internal Server Error');
    };
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(500);
    // Restore original handler
    app._router.stack.find(r => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = original;
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'A-Bomb');
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return the powerstats for the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/2/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      intelligence: 100,
      strength: 18,
      speed: 23,
      durability: 28,
      power: 32,
      combat: 32
    });
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/xyz/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/compare', () => {
  it('should compare two superheroes and return correct category winners and overall winner', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=2');
    expect(response.status).toBe(200);
    expect(response.body.id1).toBe(1);
    expect(response.body.id2).toBe(2);
    expect(Array.isArray(response.body.categories)).toBe(true);
    expect(response.body.categories.length).toBe(6);
    // Check order and values
    const expectedOrder = ['intelligence','strength','speed','durability','power','combat'];
    response.body.categories.forEach((cat, idx) => {
      expect(cat.name).toBe(expectedOrder[idx]);
      expect(['1','2','tie',1,2]).toContain(cat.winner);
      expect(typeof cat.id1_value).toBe('number');
      expect(typeof cat.id2_value).toBe('number');
    });
    // For ids 1 and 2, id1 wins 3, id2 wins 3, so tie
    expect(response.body.overall_winner).toBe('tie');
  });

  it('should return 400 if id1 or id2 is missing', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1');
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/required/);
  });

  it('should return 404 if either superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=999');
    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/not found/);
  });

  it('should return correct winner when one hero wins more categories', async () => {
    // id3 vs id2: id3 wins 5 categories, id2 wins 1
    const response = await request(app).get('/api/superheroes/compare?id1=3&id2=2');
    expect(response.status).toBe(200);
    expect(response.body.overall_winner).toBe(3);
    // id2 vs id1: id2 wins 3, id1 wins 3, tie
    const tieResponse = await request(app).get('/api/superheroes/compare?id1=2&id2=1');
    expect(tieResponse.status).toBe(200);
    expect(tieResponse.body.overall_winner).toBe('tie');
  });
});
