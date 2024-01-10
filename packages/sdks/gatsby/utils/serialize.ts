import { NinetailedPreviewPluginOptions } from '../plugin-options';

/**
 * Constructs an object/context holding serialized functions along with an array of their names
 * @param objectToSerialize - The object to serialize
 */
const constructSerializationContext = (
  objectToSerialize: Record<string, unknown>
) => {
  return Object.keys(objectToSerialize).reduce(
    (acc, key) => {
      const optionValue = objectToSerialize[key];
      if (optionValue && typeof optionValue === 'function') {
        const serializedFunction = optionValue.toString();

        // Storing the keys of the serialized functions in a separate array in the context object
        acc['serializedFunctionsNames'].push(key);

        return { ...acc, [key]: serializedFunction };
      }
      return acc;
    },
    { serializedFunctionsNames: [] as string[] }
  );
};

export const serializePluginOptionFunctions = (
  pluginOptions: NinetailedPreviewPluginOptions
) => {
  const serializedOptionsContext = constructSerializationContext(pluginOptions);

  const {
    serializedFunctionsNames: serializedOptionFunctionNames,
    ...serializedOptionFunctions
  } = serializedOptionsContext;

  if (!pluginOptions.customOptions) {
    return {
      serializedOptionFunctions,
      serializedOptionFunctionNames,
      serializedCustomOptionFunctions: {},
      serializedCustomOptionFunctionNames: [],
    };
  }

  const serializedCustomOptionsContext = constructSerializationContext(
    pluginOptions.customOptions
  );

  const {
    serializedFunctionsNames: serializedCustomOptionFunctionNames,
    ...serializedCustomOptionFunctions
  } = serializedCustomOptionsContext;

  return {
    serializedOptionFunctions,
    serializedOptionFunctionNames,
    serializedCustomOptionFunctions,
    serializedCustomOptionFunctionNames,
  };
};
