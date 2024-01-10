import { Entry, EntryLike } from '../types/Entry';
import type { EntryFields } from '../types/EntryFields';

export const isEntry = <Fields extends EntryFields>(
  entry: EntryLike<Fields>
): entry is Entry<Fields> => {
  return Entry.safeParse(entry).success;
};
