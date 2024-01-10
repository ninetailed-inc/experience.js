import { type TrackComponentProperties } from '../src/lib/TrackingProperties';
import {
  NinetailedAnalyticsPlugin,
  SanitizedElementSeenPayload,
  Template,
} from '../src/lib/NinetailedAnalyticsPlugin';

export class TestAnalyticsPlugin extends NinetailedAnalyticsPlugin {
  public name = 'test';

  constructor(
    readonly template: Template,
    public readonly onTrackExperienceMock: jest.Mock,
    public readonly onTrackComponentMock: jest.Mock
  ) {
    super(template);
  }

  protected async onTrackExperience(
    properties: SanitizedElementSeenPayload,
    hasSeenExperienceEventPayload: Record<string, string>
  ) {
    this.onTrackExperienceMock(properties, hasSeenExperienceEventPayload);
  }

  protected async onTrackComponent(properties: TrackComponentProperties) {
    this.onTrackComponentMock(properties);
  }
}
