import { pickBy } from './pickBy';
describe('pickBy', () => {
  it('should return an object with only the keys that match the predicate', () => {
    const result = pickBy({ id: 1, name: 'John' }, (_, key) => key === 'id');
    expect(result).toEqual({ id: 1 });
  });
  it('should return an empty object when no keys match the predicate', () => {
    // @ts-expect-error intentionally passing an invalid predicate
    const result = pickBy({ id: 1, name: 'John' }, (_, key) => key === 'age');
    expect(result).toEqual({});
  });
});
