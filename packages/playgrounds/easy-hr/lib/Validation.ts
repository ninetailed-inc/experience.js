import { ReactNode } from 'react';
import {
  AnySchema as YupSchema,
  ValidationError as YupValidationError,
} from 'yup';

import { get, set } from 'radash';

export type Translator = (errorObj: YupValidationError) => string | ReactNode;

export interface ValidationError {
  [key: string]: ValidationError | string;
}

function normalizeValidationError(
  err: YupValidationError,
  translator?: Translator
): ValidationError {
  return err.inner.reduce((errors, innerError) => {
    const { path, message } = innerError;
    const el: ReturnType<Translator> = translator
      ? translator(innerError)
      : message;
    if (path && Object.prototype.hasOwnProperty.call(errors, path)) {
      const prev = get(errors, path) as ReactNode[];
      prev.push(el);
      set(errors, path, prev);
    } else {
      set(errors, path as string, [el]);
    }
    return errors;
  }, {});
}

export function makeValidate<T>(
  validator: YupSchema<T>,
  translator?: Translator
) {
  return async (values: T): Promise<ValidationError> => {
    try {
      await validator.validate(values, { abortEarly: false });
      return {};
    } catch (err) {
      return normalizeValidationError(err as YupValidationError, translator);
    }
  };
}
