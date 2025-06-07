/*
    cycle.js
    2021-05-31

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    https://github.com/douglascrockford/JSON-js/blob/master/cycle.js

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

export const decycle = function decycle(
  object: unknown,
  replacer?: (v: unknown) => unknown
) {
  // Make a deep copy of an object or array, assuring that there is at most
  // one instance of each object or array in the resulting structure. The
  // duplicate references (which might be forming cycles) are replaced with
  // an object of the form

  //      {"$ref": PATH}

  // where the PATH is a JSONPath string that locates the first occurance.

  // So,

  //      const a = [];
  //      a[0] = a;
  //      return JSON.stringify(decycle(a));

  // produces the string '[{"$ref":"$"}]'.

  // If a replacer function is provided, then it will be called for each value.
  // A replacer function receives a value and returns a replacement value.

  // JSONPath is used to locate the unique object. $ indicates the top level of
  // the object or array. [NUMBER] or [STRING] indicates a child element or
  // property.

  const objects = new WeakMap<object, string>(); // object to path mappings

  return (function derez(value, path) {
    // The derez function recurses through the object, producing the deep copy.

    // If a replacer function was provided, then call it to get a replacement value.

    if (replacer !== undefined) {
      value = replacer(value);
    }

    // typeof null === "object", so go on if this value is really an object but not
    // one of the weird builtin objects.

    if (
      typeof value === 'object' &&
      value !== null &&
      !(value instanceof Boolean) &&
      !(value instanceof Date) &&
      !(value instanceof Number) &&
      !(value instanceof RegExp) &&
      !(value instanceof String)
    ) {
      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a {"$ref":PATH} object.
      const oldPath = objects.get(value);

      if (oldPath !== undefined) {
        return { $ref: oldPath };
      }

      // Otherwise, accumulate the unique value and its path.
      objects.set(value, path);

      // If it is an array, replicate the array.
      if (Array.isArray(value)) {
        const newItem: unknown[] = [];
        value.forEach(function (element, i) {
          newItem[i] = derez(element, path + '[' + i + ']');
        });
        return newItem;
      } else {
        // If it is an object, replicate the object.
        const newItem: { [key: string]: unknown } = {};
        Object.keys(value).forEach(function (name) {
          newItem[name] = derez(
            (value as { [key: string]: unknown })[name],
            path + '[' + JSON.stringify(name) + ']'
          );
        });
        return newItem;
      }
    }
    return value;
  })(object, '$');
};
