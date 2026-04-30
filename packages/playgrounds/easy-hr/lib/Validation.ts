import {
  AnySchema as YupSchema,
  ValidationError as YupValidationError,
} from 'yup';

export interface ValidationError {
  [key: string]: string;
}

function normalizeValidationError(error: YupValidationError): ValidationError {
  return error.inner.reduce<ValidationError>((errors, innerError) => {
    const { path, message } = innerError;
    if (path) {
      errors[path] = message;
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
