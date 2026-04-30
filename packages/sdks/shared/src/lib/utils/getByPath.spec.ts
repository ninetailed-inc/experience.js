import { getByPath } from './getByPath';

describe('getByPath', () => {
  it('should resolve top-level keys', () => {
    expect(getByPath({ name: 'world' }, 'name')).toEqual('world');
  });

  it('should resolve nested keys', () => {
    expect(getByPath({ user: { name: 'world' } }, 'user.name')).toEqual(
      'world'
    );
  });

  it('should resolve deep nested keys', () => {
    expect(
      getByPath({ user: { profile: { name: 'world' } } }, 'user.profile.name')
    ).toEqual('world');
  });

  it('should resolve array index paths', () => {
    expect(getByPath({ user: [{ name: 'world' }] }, 'user.0.name')).toEqual(
      'world'
    );
  });

  it('should resolve paths on root arrays', () => {
    expect(getByPath([{ name: 'world' }], '0.name')).toEqual('world');
  });

  it('should return undefined for missing keys', () => {
    expect(getByPath({ user: { id: '123' } }, 'user.name')).toBeUndefined();
  });

  it('should return undefined for missing intermediate paths', () => {
    expect(
      getByPath({ user: { id: '123' } }, 'user.profile.name')
    ).toBeUndefined();
  });

  it('should return undefined for missing array indexes', () => {
    expect(
      getByPath({ user: [{ name: 'world' }] }, 'user.1.name')
    ).toBeUndefined();
  });

  it('should trim path input before resolving', () => {
    expect(getByPath({ user: { name: 'world' } }, '  user.name  ')).toEqual(
      'world'
    );
  });

  it('should return undefined for empty path input', () => {
    expect(getByPath({ user: { name: 'world' } }, '')).toBeUndefined();
    expect(getByPath({ user: { name: 'world' } }, '   ')).toBeUndefined();
  });

  it('should return undefined for paths with empty segments', () => {
    expect(
      getByPath({ user: { name: 'world' } }, 'user..name')
    ).toBeUndefined();
    expect(
      getByPath({ user: { name: 'world' } }, '.user.name')
    ).toBeUndefined();
    expect(
      getByPath({ user: { name: 'world' } }, 'user.name.')
    ).toBeUndefined();
  });

  it('should preserve 0 values', () => {
    expect(getByPath({ count: 0 }, 'count')).toBe(0);
  });

  it('should preserve false values', () => {
    expect(getByPath({ enabled: false }, 'enabled')).toBe(false);
  });

  it('should preserve empty string values', () => {
    expect(getByPath({ name: '' }, 'name')).toBe('');
  });

  it('should preserve null values', () => {
    expect(getByPath({ value: null }, 'value')).toBeNull();
  });

  it('should block __proto__ path access', () => {
    expect(
      getByPath({ user: { name: 'world' } }, 'user.__proto__.name')
    ).toBeUndefined();
  });

  it('should block constructor path access', () => {
    expect(
      getByPath({ user: { name: 'world' } }, 'user.constructor.name')
    ).toBeUndefined();
  });

  it('should block prototype path access', () => {
    expect(
      getByPath({ user: { name: 'world' } }, 'user.prototype.name')
    ).toBeUndefined();
  });

  it('should not read inherited properties', () => {
    const parent = { inherited: 'value' };
    const child = Object.create(parent) as Record<string, unknown>;
    child.own = 'own-value';

    expect(getByPath(child, 'own')).toEqual('own-value');
    expect(getByPath(child, 'inherited')).toBeUndefined();
  });
});
