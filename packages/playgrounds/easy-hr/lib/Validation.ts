import {
  AnySchema as YupSchema,
  ValidationError as YupValidationError,
} from 'yup';
import { get, set } from 'radash';

export interface ValidationError {
  [key: string]: ValidationError | string;
}

function normalizeValidationError(err: YupValidationError): ValidationError {
  return err.inner.reduce((errors, innerError) => {
    const { path, message } = innerError;
    const el = message;
    if (path && Object.prototype.hasOwnProperty.call(errors, path)) {
      const prev = get(errors, path) as string[];
      prev.push(el);
      set(errors, path, prev);
    } else {
      set(errors, path as string, [el]);
    }
    return errors;
  }, {});
}

export function makeValidate<T>(validator: YupSchema<T>) {
  return async (values: T): Promise<ValidationError> => {
    try {
      await validator.validate(values, { abortEarly: false });
      return {};
    } catch (err) {
      return normalizeValidationError(err as YupValidationError);
    }
  };
}
