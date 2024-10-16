type GetItem<T = any> = (key: string) => T;

type SetItem<T = any> = (key: string, value: T) => void;

type RemoveItem = (key: string) => void;

export type Storage = {
  getItem: GetItem;
  setItem: SetItem;
  removeItem: RemoveItem;
};
