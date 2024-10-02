import dbClient from '../utils/db';

describe('DB Client', () => {
  beforeAll(async () => {
    await dbClient.client.connect();
  });

  afterAll(async () => {
    await dbClient.client.close();
  });

  test('isAlive returns true when connected', () => {
    expect(dbClient.isAlive()).toBe(true);
  });

  test('nbUsers returns correct number of users', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(typeof usersCount).toBe('number');
  });

  test('nbFiles returns correct number of files', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(typeof filesCount).toBe('number');
  });
});
