import {
  EventHandler,
  VariableSeenPayload,
  HAS_SEEN_VARIABLE,
} from '@ninetailed/experience.js-plugin-analytics';

export interface InterestedInSeenVariables {
  [HAS_SEEN_VARIABLE]: EventHandler<VariableSeenPayload>;
}
