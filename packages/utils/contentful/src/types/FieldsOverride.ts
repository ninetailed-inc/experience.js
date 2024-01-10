import { EntryFields } from './EntryFields';

export type FieldsOverride<Entry, Fields extends EntryFields> = Omit<
  Entry,
  'fields'
> & {
  fields: Fields;
};
