import { Change } from '@ninetailed/experience.js-shared';

/**
 * Arguments passed to changes modification middleware
 */
export interface ChangesModificationMiddlewareArg {
  changes: Change[];
}

/**
 * A middleware function that can modify changes
 */
export type ChangesModificationMiddleware = (
  arg: ChangesModificationMiddlewareArg
) => ChangesModificationMiddlewareArg;

/**
 * Arguments for building a changes modification middleware
 */
export type BuildChangesModificationMiddlewareArg = {
  changes: Change[];
};

/**
 * Type for a function that builds changes modification middleware
 */
export type BuildChangesModificationMiddleware = (
  arg: BuildChangesModificationMiddlewareArg
) => ChangesModificationMiddleware | undefined;

/**
 * Interface for plugins that can provide changes modification middleware
 */
export interface HasChangesModificationMiddleware {
  /**
   * Returns a middleware function that can modify changes
   */
  getChangesModificationMiddleware: BuildChangesModificationMiddleware;
}
