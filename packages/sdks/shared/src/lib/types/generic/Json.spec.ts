import { JsonLiteralObject } from './Json';
describe('JsonLiteralObject', () => {
  it('should be able to parse a simple object', () => {
    const data = {
      name: 'John Doe',
      email: 'john@foo.com',
    };
    const result = JsonLiteralObject.safeParse(data);
    expect(result.success).toBe(true);
  });
  it('should be able to parse a null value', () => {
    const data = {
      nullish: null,
    };
    const result = JsonLiteralObject.safeParse(data);
    expect(result.success).toBe(true);
  });
  describe('array parsing', () => {
    it('should be able to parse an object with array keys', () => {
      const data = {
        favoriteColors: ['red', 'blue', 'green'],
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
    it('should be able to parse an with diefferent types', () => {
      const data = {
        favoriteThings: ['red', 'blue', 'green', 1, true, { foo: 'bar' }, null],
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
    it('should be able to parse an array of objects', () => {
      const data = {
        favoriteNamedColors: [
          { name: 'red' },
          { name: 'blue' },
          { name: 'green' },
        ],
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
    it('should be able to parse nested arrays', () => {
      const data = {
        matrix: [[1, 2, 3]],
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
    it('should be able to parse nested arrays of objects', () => {
      const data = {
        matrix: [
          [{ name: 'red' }, { name: 'blue' }, { name: 'green' }],
          '1',
          1,
          true,
          { foo: 'bar' },
          ['foo', 'bar', 1, true, { foo: 'bar' }],
        ],
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
  describe('object parsing', () => {
    it('should be able to parse an object with nested objects', () => {
      const data = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown',
        },
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
    it('should be able to parse an empty object', () => {
      const data = {};
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
    it('should be able to parse an deeply nested object', () => {
      const data = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          country: 'USA',
          geo: {
            lat: 123.456,
            lon: 789.012,
          },
        },
        foo: [{ bar: [{ baz: 'qux', lub: { check: 1 } }] }],
      };
      const result = JsonLiteralObject.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
