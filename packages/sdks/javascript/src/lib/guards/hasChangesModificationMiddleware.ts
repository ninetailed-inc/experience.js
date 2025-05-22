import { HasChangesModificationMiddleware } from '../types/interfaces/HasChangesModificationMiddleware';

/**
 * Type guard that checks if an object implements the HasChangesModificationMiddleware interface
 *
 * @param arg Object to check
 * @returns Boolean indicating if the object implements HasChangesModificationMiddleware
 */
export const hasChangesModificationMiddleware = (
  arg: unknown
): arg is HasChangesModificationMiddleware => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'getChangesModificationMiddleware' in arg &&
    typeof arg.getChangesModificationMiddleware === 'function'
  );
};
