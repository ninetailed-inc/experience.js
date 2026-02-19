import { pipe } from './pipe';
describe('pipe', () => {
  it('should pipe functions from left to right', () => {
    const add = (a: number) => (b: number) => a + b;
    const multiply = (a: number) => (b: number) => a * b;
    const multiplyAndAdd = pipe(multiply(2), add(2));
    expect(multiplyAndAdd(3)).toEqual(8);
    const addAndMultiply = pipe(add(2), multiply(2));
    expect(addAndMultiply(3)).toEqual(10);
    const addAndMultiplyAndAdd = pipe(add(2), multiply(2), add(3));
    expect(addAndMultiplyAndAdd(3)).toEqual(13);
  });
});
