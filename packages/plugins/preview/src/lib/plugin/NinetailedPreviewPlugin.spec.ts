import {
  ChangeTypes,
  ComponentTypeEnum,
  type Change,
} from '@ninetailed/experience.js-shared';
import { NinetailedPreviewPlugin } from './NinetailedPreviewPlugin';

describe('NinetailedPreviewPlugin', () => {
  const setupPlugin = (experiences: unknown[] = []) => {
    const plugin = new NinetailedPreviewPlugin({
      experiences: experiences as never,
      audiences: [],
    } as never);

    (plugin as never as { isActiveInstance: boolean }).isActiveInstance = true;
    (plugin as never as { bridge: { updateProps: jest.Mock } }).bridge = {
      updateProps: jest.fn(),
    };
    (
      plugin as never as { onChangeEmitter: { invokeListeners: jest.Mock } }
    ).onChangeEmitter = {
      invokeListeners: jest.fn(),
    };

    return plugin;
  };

  it('should keep variable overwrite unchanged when value did not change', () => {
    const plugin = setupPlugin();
    const overrideKey = 'exp-1:my-key';
    const existingChange: Change = {
      type: ChangeTypes.Variable,
      key: 'my-key',
      value: {
        nested: {
          list: [1, 2, 3],
        },
      },
      meta: {
        experienceId: 'exp-1',
        variantIndex: 1,
      },
    };

    const pluginState = plugin as never as {
      variableOverwrites: Record<string, Change>;
      onChangeEmitter: { invokeListeners: jest.Mock };
    };

    pluginState.variableOverwrites = {
      [overrideKey]: existingChange,
    };

    plugin.setVariableValue({
      experienceId: 'exp-1',
      key: 'my-key',
      value: {
        nested: {
          list: [1, 2, 3],
        },
      },
      variantIndex: 1,
    });

    expect(pluginState.variableOverwrites[overrideKey]).toBe(existingChange);
    expect(pluginState.onChangeEmitter.invokeListeners).not.toHaveBeenCalled();
  });

  it('should update variable overwrite and notify when value changed', () => {
    const plugin = setupPlugin();
    const overrideKey = 'exp-1:my-key';
    const existingChange: Change = {
      type: ChangeTypes.Variable,
      key: 'my-key',
      value: {
        nested: {
          list: [1, 2, 3],
        },
      },
      meta: {
        experienceId: 'exp-1',
        variantIndex: 1,
      },
    };

    const pluginState = plugin as never as {
      variableOverwrites: Record<string, Change>;
      onChangeEmitter: { invokeListeners: jest.Mock };
    };

    pluginState.variableOverwrites = {
      [overrideKey]: existingChange,
    };

    plugin.setVariableValue({
      experienceId: 'exp-1',
      key: 'my-key',
      value: {
        nested: {
          list: [1, 2, 4],
        },
      },
      variantIndex: 1,
    });

    expect(pluginState.variableOverwrites[overrideKey]).not.toBe(
      existingChange
    );
    expect(pluginState.variableOverwrites[overrideKey]?.value).toEqual({
      nested: {
        list: [1, 2, 4],
      },
    });
    expect(pluginState.onChangeEmitter.invokeListeners).toHaveBeenCalled();
  });

  it('should keep inline variable overwrite unchanged when variant output is the same', () => {
    const experience = {
      id: 'exp-1',
      components: [
        {
          type: ComponentTypeEnum.InlineVariable,
          key: 'my-key',
          baseline: { value: 'baseline' },
          variants: [{ value: 'variant-1' }],
        },
      ],
    };

    const plugin = setupPlugin([experience]);
    const overrideKey = 'exp-1:my-key';
    const existingChange: Change = {
      type: ChangeTypes.Variable,
      key: 'my-key',
      value: 'variant-1',
      meta: {
        experienceId: 'exp-1',
        variantIndex: 1,
      },
    };

    const pluginState = plugin as never as {
      variableOverwrites: Record<string, Change>;
    };

    pluginState.variableOverwrites = {
      [overrideKey]: existingChange,
    };

    plugin.setExperienceVariant({
      experienceId: 'exp-1',
      variantIndex: 1,
    });

    expect(pluginState.variableOverwrites[overrideKey]).toBe(existingChange);
  });

  it('should update inline variable overwrite when variant output changed', () => {
    const experience = {
      id: 'exp-1',
      components: [
        {
          type: ComponentTypeEnum.InlineVariable,
          key: 'my-key',
          baseline: { value: 'baseline' },
          variants: [{ value: 'variant-1-new' }],
        },
      ],
    };

    const plugin = setupPlugin([experience]);
    const overrideKey = 'exp-1:my-key';
    const existingChange: Change = {
      type: ChangeTypes.Variable,
      key: 'my-key',
      value: 'variant-1-old',
      meta: {
        experienceId: 'exp-1',
        variantIndex: 1,
      },
    };

    const pluginState = plugin as never as {
      variableOverwrites: Record<string, Change>;
    };

    pluginState.variableOverwrites = {
      [overrideKey]: existingChange,
    };

    plugin.setExperienceVariant({
      experienceId: 'exp-1',
      variantIndex: 1,
    });

    expect(pluginState.variableOverwrites[overrideKey]).not.toBe(
      existingChange
    );
    expect(pluginState.variableOverwrites[overrideKey]?.value).toBe(
      'variant-1-new'
    );
    expect(
      pluginState.variableOverwrites[overrideKey]?.meta?.variantIndex
    ).toBe(1);
  });
});
