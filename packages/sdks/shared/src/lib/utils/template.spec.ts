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

  it('should replace the placeholder with two-level nested object data', () => {
    const str = 'hello {{user.profile.name}}';
    const data = {
      user: {
        profile: {
          name: 'world',
        },
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

  it('should replace with "undefined" when array index is not found', () => {
    const str = 'hello {{user.1.name}}';
    const data = {
      user: [
        {
          name: 'world',
        },
      ],
    };

    expect(template(str, data)).toEqual('hello undefined');
  });

  it('should replace placeholders when root data is an array', () => {
    const str = 'hello {{0.name}}';
    const data = [{ name: 'world' }] as unknown as Record<string, unknown>;

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

  it('should preserve 0 values', () => {
    const str = 'hello {{count}}';
    const data = {
      count: 0,
    };

    expect(template(str, data)).toEqual('hello 0');
  });

  it('should preserve false values', () => {
    const str = 'hello {{enabled}}';
    const data = {
      enabled: false,
    };

    expect(template(str, data)).toEqual('hello false');
  });

  it('should preserve empty string values', () => {
    const str = 'hello {{name}}';
    const data = {
      name: '',
    };

    expect(template(str, data)).toEqual('hello ');
  });

  it('should replace multiple placeholders in one string', () => {
    const str = '{{user.name}}-{{user.id}}';
    const data = {
      user: {
        id: '123',
        name: 'world',
      },
    };

    expect(template(str, data)).toEqual('world-123');
  });

  it('should replace repeated placeholders', () => {
    const str = '{{name}} {{name}}';
    const data = {
      name: 'world',
    };

    expect(template(str, data)).toEqual('world world');
  });

  it('should replace with "undefined" for missing intermediate paths', () => {
    const str = 'hello {{user.profile.name}}';
    const data = {
      user: {
        id: '123',
      },
    };

    expect(template(str, data)).toEqual('hello undefined');
  });
});
