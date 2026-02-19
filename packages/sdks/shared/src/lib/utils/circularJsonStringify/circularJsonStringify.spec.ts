import { circularJsonStringify } from './circularJsonStringify';
type Comment = {
  id: string;
  text: string;
  parent?: Comment;
  users?: User[];
};
type User = {
  id: string;
};
describe('circularJsonStringify', () => {
  it('should return a stringified object', () => {
    const comment: Comment = { id: '1', text: 'foo' };
    const result = circularJsonStringify(comment);
    expect(result).toEqual('{"id":"1","text":"foo"}');
  });
  it('should return a stringified object with nested objects', () => {
    const comment: Comment = {
      id: '1',
      text: 'foo',
      users: [
        {
          id: 'u1',
        },
      ],
    };
    const result = circularJsonStringify(comment);
    expect(result).toEqual('{"id":"1","text":"foo","users":[{"id":"u1"}]}');
  });
  it('should return a stringified array', () => {
    const comment1 = { id: '1', text: 'foo' };
    const comment2 = { id: '2', text: 'bar' };
    const result = circularJsonStringify([comment1, comment2]);
    expect(result).toEqual('[{"id":"1","text":"foo"},{"id":"2","text":"bar"}]');
  });
  it('should return a stringified value that is neither an object nor an array', () => {
    const result = circularJsonStringify('foo');
    expect(result).toEqual('"foo"');
    const result2 = circularJsonStringify(1);
    expect(result2).toEqual('1');
    const result3 = circularJsonStringify(null);
    expect(result3).toEqual('null');
    const result4 = circularJsonStringify(true);
    expect(result4).toEqual('true');
  });
  it('should handle circular references in an object', () => {
    const comment: Comment = { id: '1', text: 'foo' };
    comment.parent = comment;
    const result = circularJsonStringify(comment);
    expect(result).toEqual('{"id":"1","text":"foo","parent":{"$ref":"$"}}');
  });
  it('should handle non-circular references in an array of objects', () => {
    const comment1: Comment = { id: '1', text: 'foo' };
    const comment2: Comment = { id: '2', text: 'bar' };
    comment2.parent = comment1;
    const result = circularJsonStringify([comment1, comment2]);
    expect(result).toEqual(
      '[{"id":"1","text":"foo"},{"id":"2","text":"bar","parent":{"$ref":"$[0]"}}]'
    );
  });
  it('should handle circular references in an array of objects', () => {
    const comment1: Comment = { id: '1', text: 'foo' };
    const comment2: Comment = { id: '2', text: 'bar' };
    comment1.parent = comment1;
    comment2.parent = comment1;
    const result = circularJsonStringify([comment1, comment2]);
    expect(result).toEqual(
      '[{"id":"1","text":"foo","parent":{"$ref":"$[0]"}},{"id":"2","text":"bar","parent":{"$ref":"$[0]"}}]'
    );
  });
  it('should handle circular and non-circular references in an array of objects', () => {
    const comment1: Comment = { id: '1', text: 'foo' };
    const comment2: Comment = { id: '2', text: 'bar' };
    const comment3: Comment = { id: '3', text: 'baz' };
    comment1.parent = comment1;
    comment2.parent = comment1;
    comment3.parent = comment2;
    const result = circularJsonStringify([comment1, comment2, comment3]);
    expect(result).toEqual(
      '[{"id":"1","text":"foo","parent":{"$ref":"$[0]"}},{"id":"2","text":"bar","parent":{"$ref":"$[0]"}},{"id":"3","text":"baz","parent":{"$ref":"$[1]"}}]'
    );
  });
  it('should not mutate the original object', () => {
    const comment: Comment = { id: '1', text: 'foo' };
    comment.parent = comment;
    circularJsonStringify(comment);
    expect(comment.parent).toBe(comment);
  });
});
