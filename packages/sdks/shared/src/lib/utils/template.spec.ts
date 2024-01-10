import { template } from './template';

describe('template', () => {
  it('should replace the placeholder with the data', () => {
    const str = 'hello {{name}}';
    const data = {
      name: 'world',
    };
    expect(template(str, data)).toEqual('hello world');
  });

  it('should replace the placeholder with the object data', () => {
    const str = 'hello {{user.name}}';
    const data = {
      user: {
        name: 'world',
      },
    };
    expect(template(str, data)).toEqual('hello world');
  });

  it('should replace the placeholder with the array data', () => {
    const str = 'hello {{user.0.name}}';
    const data = {
      user: [
        {
          name: 'world',
        },
      ],
    };
    expect(template(str, data)).toEqual('hello world');
  });

  it('should replace with "undefined" if the data is not found', () => {
    const str = 'hello {{user.name}}';
    const data = {
      user: {
        id: '1a2b3c4d',
      },
    };
    expect(template(str, data)).toEqual('hello undefined');
  });

  it('should trim spaces in the placeholder', () => {
    const str = 'hello {{ user.name }}';
    const data = {
      user: {
        name: 'world',
      },
    };
    expect(template(str, data)).toEqual('hello world');
  });
});
