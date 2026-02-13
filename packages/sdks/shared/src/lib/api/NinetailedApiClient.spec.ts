import fetchMock from 'jest-fetch-mock';
import { generateMock } from '@anatine/zod-mock';
import { waitFor } from '@testing-library/dom';

import { logger } from '../logger/Logger';
import { LogSink } from '../logger/LogSink';
import { FEATURES, NinetailedApiClient } from './NinetailedApiClient';
import { CreateProfileResponse } from '../types/Endpoints/CreateProfile';
import { LogEvent } from 'diary';

class MockLogSink implements LogSink {
  public name = 'MockErrorLogSink';

  public onWarnMock = jest.fn();
  public onErrorMock = jest.fn();

  public ingest(event: LogEvent): void {
    if (event.level === 'warn') {
      this.onWarnMock(...event.messages);
    }

    if (event.level === 'error') {
      this.onErrorMock(...event.messages);
    }
  }
}

describe('NinetailedApiClient', () => {
  let mockLogSink: MockLogSink;
  let client: NinetailedApiClient;

  beforeEach(() => {
    logger.removeSinks();
    mockLogSink = new MockLogSink();
    logger.addSink(mockLogSink);

    client = new NinetailedApiClient({
      clientId: 'test',
      environment: 'test',
    });

    fetchMock.resetMocks();
  });

  it('should be able to create a new client', () => {
    const client = new NinetailedApiClient({
      clientId: 'test',
      environment: 'test',
    });

    expect(client).toBeDefined();
  });

  describe('Create Profile', () => {
    it('should not send AbortErrors to the errorLogSink', async () => {
      fetchMock.mockAbortOnce();
      expect(
        client.createProfile({
          events: [],
        })
      ).rejects.toThrowError();

      await waitFor(() => {
        expect(mockLogSink.onWarnMock).toBeCalledTimes(1);
        expect(mockLogSink.onWarnMock).toBeCalledWith(
          'Create Profile request aborted due to network issues. This request is not retryable.'
        );

        expect(mockLogSink.onErrorMock).toBeCalledTimes(0);
      });
    });

    it('should report FetchErrors to the errorLogSink', async () => {
      fetchMock.mockRejectOnce(new Error('test'));
      expect(
        client.createProfile({
          events: [],
        })
      ).rejects.toThrowError();

      await waitFor(() => {
        expect(mockLogSink.onErrorMock).toBeCalledTimes(1);
        expect(mockLogSink.onErrorMock).toBeCalledWith(
          'Create Profile request failed with error: [Error] test'
        );
      });
    });
  });

  describe('Update Profile', () => {
    it('should not send AbortErrors to the errorLogSink', async () => {
      fetchMock.mockAbortOnce();
      expect(
        client.updateProfile({
          profileId: 'test',
          events: [],
        })
      ).rejects.toThrowError();

      await waitFor(() => {
        expect(mockLogSink.onWarnMock).toBeCalledTimes(1);
        expect(mockLogSink.onWarnMock).toBeCalledWith(
          'Update Profile request aborted due to network issues. This request is not retryable.'
        );

        expect(mockLogSink.onErrorMock).toBeCalledTimes(0);
      });
    });

    it('should report FetchErrors to the errorLogSink', async () => {
      fetchMock.mockRejectOnce(new Error('test'));
      expect(
        client.updateProfile({
          profileId: 'test',
          events: [],
        })
      ).rejects.toThrowError();

      await waitFor(() => {
        expect(mockLogSink.onErrorMock).toBeCalledTimes(1);
        expect(mockLogSink.onErrorMock).toBeCalledWith(
          'Update Profile request failed with error: [Error] test'
        );
      });
    });
  });

  describe('UpsertMany Profiles', () => {
    it('should not send AbortErrors to the errorLogSink', async () => {
      fetchMock.mockAbortOnce();
      expect(
        client.upsertManyProfiles({
          events: [],
        })
      ).rejects.toThrowError();

      await waitFor(() => {
        expect(mockLogSink.onWarnMock).toBeCalledTimes(1);
        expect(mockLogSink.onWarnMock).toBeCalledWith(
          'Upsert Many Profiles request aborted due to network issues. This request is not retryable.'
        );

        expect(mockLogSink.onErrorMock).toBeCalledTimes(0);
      });
    });

    it('should report FetchErrors to the errorLogSink', async () => {
      fetchMock.mockRejectOnce(new Error('test'));
      expect(
        client.upsertManyProfiles({
          events: [],
        })
      ).rejects.toThrowError();

      await waitFor(() => {
        expect(mockLogSink.onErrorMock).toBeCalledTimes(1);
        expect(mockLogSink.onErrorMock).toBeCalledWith(
          'Upsert Many Profiles request failed with error: [Error] test'
        );
      });
    });
  });

  describe('Enabled features', () => {
    it('should not add the enabled features to the request if no feature is enabled', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.createProfile(
        {
          events: [],
        },
        { enabledFeatures: [] }
      );

      expect(fetchMock.mock.calls[0][1]?.body).toEqual(
        JSON.stringify({
          events: [],
          options: {},
        })
      );
    });

    it('createProfile should add the enabled features to the request', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.createProfile(
        {
          events: [],
        },
        { enabledFeatures: [FEATURES.IP_ENRICHMENT, FEATURES.LOCATION] }
      );

      expect(fetchMock.mock.calls[0][1]?.body).toEqual(
        JSON.stringify({
          events: [],
          options: {
            features: [FEATURES.IP_ENRICHMENT, FEATURES.LOCATION],
          },
        })
      );
    });

    it('updateProfile should add the enabled features to the request', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.updateProfile(
        {
          profileId: 'test',
          events: [],
        },
        { enabledFeatures: [FEATURES.IP_ENRICHMENT] }
      );

      expect(fetchMock.mock.calls[0][1]?.body).toEqual(
        JSON.stringify({
          events: [],
          options: {
            features: [FEATURES.IP_ENRICHMENT],
          },
        })
      );
    });

    it('upsertProfile should add the enabled features to the request', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.upsertProfile(
        {
          profileId: 'test',
          events: [],
        },
        { enabledFeatures: [FEATURES.IP_ENRICHMENT] }
      );

      expect(fetchMock.mock.calls[0][1]?.body).toEqual(
        JSON.stringify({
          events: [],
          options: {
            features: [FEATURES.IP_ENRICHMENT],
          },
        })
      );
    });

    it('upsertManyProfiles should add the enabled features to the request', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.upsertManyProfiles(
        {
          events: [],
        },
        { enabledFeatures: [FEATURES.IP_ENRICHMENT] }
      );

      expect(fetchMock.mock.calls[0][1]?.body).toEqual(
        JSON.stringify({
          events: [],
          options: {
            features: [FEATURES.IP_ENRICHMENT],
          },
        })
      );
    });
  });

  describe('URL construction', () => {
    it('should preserve custom path segments in base URL', async () => {
      const client = new NinetailedApiClient({
        clientId: 'test-client',
        environment: 'test-env',
        url: 'https://local-service/api/ninetailed',
      });

      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.createProfile({
        events: [],
      });

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://local-service/api/ninetailed/v2/organizations/test-client/environments/test-env/profiles'
      );
    });

    it('should handle trailing slashes in custom base URL', async () => {
      const client = new NinetailedApiClient({
        clientId: 'test-client',
        environment: 'test-env',
        url: 'https://local-service/api/ninetailed/',
      });

      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.createProfile({
        events: [],
      });

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://local-service/api/ninetailed/v2/organizations/test-client/environments/test-env/profiles'
      );
    });

    it('should work with default base URL', async () => {
      const client = new NinetailedApiClient({
        clientId: 'test-client',
        environment: 'test-env',
      });

      fetchMock.mockResponseOnce(
        JSON.stringify(generateMock(CreateProfileResponse))
      );

      await client.createProfile({
        events: [],
      });

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://experience.ninetailed.co/v2/organizations/test-client/environments/test-env/profiles'
      );
    });
  });
});
