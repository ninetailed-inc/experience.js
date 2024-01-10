export type Variant<P = unknown> = P & {
  id: string;
  audience: {
    id: string;
  };
};
