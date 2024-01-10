export const Pageview = 'page';
export const Track = 'track';
export const Identify = 'identify';
export const Screen = 'screen';
export const Group = 'group';
export const Alias = 'alias';
export const Component = 'component';

export type Pageview = typeof Pageview;
export type Track = typeof Track;
export type Identify = typeof Identify;
export type Screen = typeof Screen;
export type Group = typeof Group;
export type Alias = typeof Alias;
export type Component = typeof Component;

export type EventType =
  | Pageview
  | Track
  | Identify
  | Screen
  | Group
  | Alias
  | Component;
