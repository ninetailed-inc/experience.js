import { NinetailedAPIClient } from '@ninetailed/experience.js-node';

const client = new NinetailedAPIClient({
  clientId: 'test',
});

client.sendIdentifyEvent('', {});
client.sendTrackEvent('', 'clicked');
