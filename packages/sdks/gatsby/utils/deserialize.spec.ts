import { deserializePluginOptionFunctions } from './deserialize';

describe('Test Gatsby function deserialization', () => {
  describe('Test deserialization', () => {
    it('should deserialize a function', () => {
      const resolvedPluginOptions = {
        serializedFunctionNames: ['propertyTwo'],
        propertyTwo: '() => console.log("I\'m a function")',
      };

      expect(deserializePluginOptionFunctions(resolvedPluginOptions)).toEqual({
        propertyTwo: expect.any(Function),
      });
    });

    it('should return an empty object as no values to deserialize', () => {
      const resolvedPluginOptions = {
        serializedFunctionNames: [],
      };

      expect(deserializePluginOptionFunctions(resolvedPluginOptions)).toEqual(
        {}
      );
    });
  });
});
