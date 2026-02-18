import { unionBy } from './unionBy';
describe('unionBy', () => {
  it('should return an array with unique ids respecting the order', () => {
    const result = unionBy(
      [{ id: 1 }, { id: 2 }],
      [{ id: 2 }, { id: 4 }],
      'id'
    );
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 4 }]);
  });
  it('should return an array with the combined arrays when they are already unique', () => {
    const result = unionBy(
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }, { id: 4 }],
      'id'
    );
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
  });
});
