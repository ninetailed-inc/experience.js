const createFunctionBody = (serializedFunction: string) => {
  return '"use strict";\n return ' + serializedFunction + ';';
};

const deserializeFunction = (serializedFunction: string) => {
  // eslint-disable-next-line no-new-func
  return new Function(createFunctionBody(serializedFunction))();
};

export const deserializePluginOptionFunctions = (
  options: Record<string, unknown> & { serializedFunctionNames: string[] }
) => {
  return options.serializedFunctionNames?.reduce((acc, currFuncName) => {
    const currentFunction = options[currFuncName];
    if (currentFunction && typeof currentFunction === 'string') {
      return {
        ...acc,
        [currFuncName]: deserializeFunction(currentFunction),
      };
    }
    return acc;
  }, {} as Record<string, (...args: unknown[]) => void>);
};
