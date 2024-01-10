import { serializePluginOptionFunctions } from './serialize';
import { NinetailedPreviewPluginOptions } from '../plugin-options';

describe('Test Gatsby function serialization', () => {
  describe('Test serialization', () => {
    it('should serialize a function in the options', () => {
      const pluginOptions = {
        propertyOne: 'String Property',
        propertyTwo: () => console.log("I'm a function"),
        propertyThree: {
          objectKey: 'Object Value',
        },
        customOptions: {},
      } as unknown as NinetailedPreviewPluginOptions;

      expect(serializePluginOptionFunctions(pluginOptions)).toEqual({
        serializedOptionFunctions: {
          propertyTwo: '() => console.log("I\'m a function")',
        },
        serializedOptionFunctionNames: ['propertyTwo'],
        serializedCustomOptionFunctions: {},
        serializedCustomOptionFunctionNames: [],
      });
    });

    it('should serialize a function in the custom options', () => {
      const pluginOptions = {
        customOptions: {
          customPropertyOne: () => console.log("I'm a function"),
        },
      } as unknown as NinetailedPreviewPluginOptions;

      expect(serializePluginOptionFunctions(pluginOptions)).toEqual({
        serializedOptionFunctions: {},
        serializedOptionFunctionNames: [],
        serializedCustomOptionFunctions: {
          customPropertyOne: '() => console.log("I\'m a function")',
        },
        serializedCustomOptionFunctionNames: ['customPropertyOne'],
      });
    });

    it('should return empty if no function is declared', () => {
      const pluginOptions = {
        propertyOne: 'String Property',
        propertyThree: {
          objectKey: 'Object Value',
        },
        customOptions: {},
      } as unknown as NinetailedPreviewPluginOptions;

      expect(serializePluginOptionFunctions(pluginOptions)).toEqual({
        serializedOptionFunctions: {},
        serializedOptionFunctionNames: [],
        serializedCustomOptionFunctions: {},
        serializedCustomOptionFunctionNames: [],
      });
    });
  });
});
