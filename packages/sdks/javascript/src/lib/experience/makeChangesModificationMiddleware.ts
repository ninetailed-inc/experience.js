import { Change, pipe } from '@ninetailed/experience.js-shared';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';

import { RemoveOnChangeListener } from '../utils/OnChangeEmitter';
import { selectPluginsHavingOnChangeEmitter } from '../plugins/selectPluginsHavingOnChangeEmitter';
import { selectPluginsHavingChangesModificationMiddleware } from '../plugins/selectPluginsHavingChangesModificationMiddleware';
import {
  ChangesModificationMiddleware,
  ChangesModificationMiddlewareArg,
} from '../types/interfaces/HasChangesModificationMiddleware';

/**
 * Arguments for creating a changes modification middleware
 */
type CreateChangesModificationMiddlewareArg = {
  plugins: NinetailedPlugin[];
  changes: Change[];
};

/**
 * Arguments for making a changes modification middleware with change notification
 */
type MakeChangesModificationMiddlewareArg =
  CreateChangesModificationMiddlewareArg & {
    onChange: (middleware: ChangesModificationMiddleware) => void;
  };

/**
 * Result of creating a changes modification middleware
 */
interface ChangesModificationMiddlewareResult {
  addListeners: () => void;
  removeListeners: () => void;
  middleware: ChangesModificationMiddleware;
}

/**
 * Creates a pass-through middleware that doesn't modify changes
 */
const createPassThroughMiddleware = (): ChangesModificationMiddleware => {
  return ({ changes }: ChangesModificationMiddlewareArg) => {
    return { changes };
  };
};

/**
 * Creates a middleware function by composing middleware from multiple plugins
 */
function createChangesModificationMiddleware({
  plugins,
  changes,
}: CreateChangesModificationMiddlewareArg): ChangesModificationMiddleware {
  const pluginsWithMiddleware =
    selectPluginsHavingChangesModificationMiddleware(plugins);

  const middlewareFunctions: ChangesModificationMiddleware[] = [];

  for (const plugin of pluginsWithMiddleware) {
    const middleware = plugin.getChangesModificationMiddleware({
      changes,
    });

    if (middleware !== undefined) {
      middlewareFunctions.push(middleware);
    }
  }

  // If no middleware functions were found, return a pass-through middleware
  if (middlewareFunctions.length === 0) {
    return createPassThroughMiddleware();
  }

  // Compose middleware functions using pipe
  return pipe(...middlewareFunctions);
}

/**
 * Creates a changes modification middleware system with change notification
 *
 * This follows the same pattern as the experience selection middleware system
 */
export const makeChangesModificationMiddleware = ({
  plugins,
  onChange,
  changes,
}: MakeChangesModificationMiddlewareArg): ChangesModificationMiddlewareResult => {
  let removeChangeListeners: RemoveOnChangeListener[] = [];

  const pluginsHavingChangeEmitters =
    selectPluginsHavingOnChangeEmitter(plugins);

  const middleware = createChangesModificationMiddleware({
    plugins,
    changes,
  });

  const addListeners = () => {
    removeChangeListeners = pluginsHavingChangeEmitters.map((plugin) => {
      const listener = () => {
        // When a plugin changes, recreate the middleware and notify
        const updatedMiddleware = createChangesModificationMiddleware({
          plugins,
          changes,
        });
        onChange(updatedMiddleware);
      };

      return plugin.onChangeEmitter.addListener(listener);
    });
  };

  // WARNING: This specific implementation using forEach is required.
  // DO NOT replace with for...of or other loop constructs as they will break functionality.
  // The exact reason is uncertain but appears related to the transpiler.
  const removeListeners = () => {
    removeChangeListeners.forEach((removeListener) => removeListener());
  };

  return {
    addListeners,
    removeListeners,
    middleware,
  };
};
