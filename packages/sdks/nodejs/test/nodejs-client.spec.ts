import fetchMock from 'jest-fetch-mock';
import { NinetailedAPIClient } from '../src/lib/Client/Client';
describe('Node.js client', () => {
  let client: NinetailedAPIClient;
  beforeEach(() => {
    client = new NinetailedAPIClient({
      clientId: process.env.NINETAILED_CLIENT_ID || '',
      environment: process.env.NINETAILED_ENVIRONMENT,
    });
  });
  it('Should use a custom fetch implementation when provided', async () => {
    const fetchImpl = jest.fn(async () => {
      return {
        ok: false,
        status: 418,
        statusText: "I'm a teapot",
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as Response;
    });

    client = new NinetailedAPIClient({
      clientId: 'client-id',
      environment: 'main',
      url: 'https://example.com',
      fetchImpl,
    });

    await expect(client.getProfile('profile-id')).rejects.toThrow(
      'Get Profile request failed with status'
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.com/v2/organizations/client-id/environments/main/profiles/profile-id',
      expect.objectContaining({
        method: 'GET',
        timeout: 3000,
      })
    );
  });
  it('Should send identify event and return a profile promise', async () => {
    fetchMock.dontMock();
    const response = client.sendIdentifyEvent('testUser', {
      trait1: 'A string',
      trait2: 'A string with a number: 23',
      trait3: 23,
      trait4: true,
    });
    await expect(response).resolves.not.toThrow();
    await expect(response).resolves.toBeDefined();
    await expect(response).resolves.toBeInstanceOf(Object);
    await expect(response).resolves.toHaveProperty('traits');
  });
  it('Should send a track event and return a profile promise', async () => {
    fetchMock.dontMock();
    const response = client.sendTrackEvent('testUser', 'testEvent');
    await expect(response).resolves.not.toThrow();
    await expect(response).resolves.toBeDefined();
    await expect(response).resolves.toBeInstanceOf(Object);
    await expect(response).resolves.toHaveProperty('traits');
  });
  it("Should get a profile by it's id", async () => {
    fetchMock.dontMock();
    // given we create a profile with a custom id
    await client.sendIdentifyEvent('testUser', {});
    const response = client.getProfile('testUser');
    await expect(response).resolves.not.toThrow();
    await expect(response).resolves.toBeDefined();
    await expect(response).resolves.toBeInstanceOf(Object);
    await expect(response).resolves.toHaveProperty(['profile', 'traits']);
  });
});
