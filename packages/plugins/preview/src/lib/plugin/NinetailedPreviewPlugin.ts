import {
  logger,
  Profile,
  Change,
  Reference,
  unionBy,
  ChangeTypes,
  AllowedVariableType,
  EntryReplacement,
  ComponentTypeEnum,
} from '@ninetailed/experience.js-shared';
import {
  ExperienceConfiguration,
  PROFILE_CHANGE,
  isExperienceMatch,
  selectDistribution,
  HasExperienceSelectionMiddleware,
  OnChangeEmitter,
  BuildExperienceSelectionMiddleware,
  HasChangesModificationMiddleware,
  ChangesModificationMiddlewareArg,
  BuildChangesModificationMiddleware,
  type ProfileChangedPayload,
  type InterestedInProfileChange,
} from '@ninetailed/experience.js';
import type {
  PreviewPluginApi,
  ExposedAudienceDefinition,
  PreviewBridgeOptions,
} from '@ninetailed/experience.js-preview-bridge';
import {
  type EventHandler,
  NinetailedPlugin,
} from '@ninetailed/experience.js-plugin-analytics';

import { WidgetContainer, WidgetContainerOptions } from './WidgetContainer';
import { isEqual } from 'radash';

export const NINETAILED_PREVIEW_EVENTS = {
  previewAudiences: 'previewAudiences',
  previewTraits: 'previewTraits',
};

type NinetailedPreviewPluginOptions = {
  experiences: ExperienceConfiguration[];
  audiences: ExposedAudienceDefinition[];
  onOpenExperienceEditor?: (experience: ExperienceConfiguration) => void;
  onOpenAudienceEditor?: (audience: ExposedAudienceDefinition) => void;
} & PreviewBridgeOptions &
  WidgetContainerOptions;

export class NinetailedPreviewPlugin
  extends NinetailedPlugin
  implements
    HasExperienceSelectionMiddleware<Reference, Reference>,
    HasChangesModificationMiddleware,
    InterestedInProfileChange
{
  public name = 'ninetailed:preview' + Math.random();

  private isOpen = false;

  private readonly experiences: ExperienceConfiguration[] = [];
  private readonly audienceDefinitions: ExposedAudienceDefinition[] = [];

  private audienceOverwrites: Record<string, boolean> = {};
  private experienceVariantIndexOverwrites: Record<string, number> = {};
  private variableOverwrites: Record<string, Change> = {};

  private profile: Profile | null = null;
  private changes: Change[] = [];

  private container: WidgetContainer | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private bridge: any = null;

  /**
   * Since several instances of the plugin can be created, we need to make sure only one is marked as active.
   */
  private isActiveInstance = false;

  private onChangeEmitter = new OnChangeEmitter();

  private readonly onOpenExperienceEditor;
  private readonly onOpenAudienceEditor;

  private clientId: string | null = null;
  private environment: string | null = null;

  constructor(private readonly options: NinetailedPreviewPluginOptions) {
    super();
    this.experiences = options.experiences || [];
    this.audienceDefinitions = options.audiences || [];
    this.onOpenExperienceEditor = options.onOpenExperienceEditor;
    this.onOpenAudienceEditor = options.onOpenAudienceEditor;
  }

  public initialize = async () => {
    if (typeof window !== 'undefined') {
      if (WidgetContainer.isContainerAttached()) {
        logger.warn('Preview plugin is already attached.');
        this.isActiveInstance = false;
        return;
      }

      const { PreviewBridge } = await import(
        '@ninetailed/experience.js-preview-bridge'
      );

      this.isActiveInstance = true;

      this.container = new WidgetContainer({ ui: this.options.ui });

      this.bridge = PreviewBridge({
        url: this.options.url,
        nonce: this.options.nonce,
      });
      this.bridge.render(this.container.element);

      window.ninetailed = Object.assign({}, window.ninetailed, {
        plugins: {
          ...window.ninetailed?.plugins,
          preview: this.windowApi,
        },
      });

      this.bridge.updateProps({ props: this.pluginApi });

      if (!this.changes?.length) {
        this.onChange();
      }
    }
  };

  public loaded = () => true;

  public [PROFILE_CHANGE]: EventHandler<ProfileChangedPayload> = ({
    payload,
  }) => {
    if (!this.isActiveInstance) {
      return;
    }

    if (payload?.profile) {
      this.onProfileChange(payload.profile, payload.changes || []);
    }
  };

  public open() {
    if (!this.isActiveInstance) {
      return;
    }

    this.container?.open();
    this.isOpen = true;
    this.onChange();
  }

  public close() {
    if (!this.isActiveInstance) {
      return;
    }

    this.container?.close();
    setTimeout(() => {
      this.isOpen = false;
      this.onChange();
    }, 700);
  }

  public toggle() {
    if (!this.isActiveInstance) {
      return;
    }

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public activateAudience(id: string) {
    if (!this.isActiveInstance) {
      return;
    }

    if (!this.isKnownAudience(id)) {
      logger.warn(`You cannot activate an unknown audience (id: ${id}).`);
      return;
    }

    this.audienceOverwrites = {
      ...this.audienceOverwrites,
      [id]: true,
    };

    this.experienceVariantIndexOverwrites = {
      ...this.experienceVariantIndexOverwrites,
      ...this.experiences
        .filter((experience) => experience.audience?.id === id)
        .map((experience) => experience.id)
        .reduce((acc, curr) => {
          return {
            ...acc,
            [curr]: this.experienceVariantIndexes[curr] || 0,
          };
        }, {}),
    };

    this.experiences
      .filter((experience) => experience.audience?.id === id)
      .forEach((experience) => {
        const variantIndex =
          this.experienceVariantIndexOverwrites[experience.id] || 0;

        // Keep inline variable flags in sync when forcing an audience.
        this.applyInlineVariableOverridesForExperience(
          experience,
          variantIndex
        );
      });

    this.onChange();
  }

  public deactivateAudience(id: string) {
    if (!this.isActiveInstance) {
      return;
    }

    if (!this.isKnownAudience(id)) {
      logger.warn(
        `You cannot deactivate an unknown audience (id: ${id}). How did you get it in the first place?`
      );
      return;
    }

    this.audienceOverwrites = {
      ...this.audienceOverwrites,
      [id]: false,
    };

    this.onChange();
  }

  public resetAudience(id: string) {
    if (!this.isActiveInstance) {
      return;
    }

    if (!this.isKnownAudience(id)) {
      logger.warn(
        `You cannot reset an unknown audience (id: ${id}). How did you get it in the first place?`
      );
      return;
    }

    // Identify all experiences that belong to this audience
    const experiencesToReset = this.experiences.filter(
      (experience) => experience.audience?.id === id
    );

    if (experiencesToReset.length > 0) {
      const experienceIdsToReset = experiencesToReset.map((e) => e.id);

      // 1. Clear any variable overwrites that were set for these experiences (allows natural evaluation)
      this.variableOverwrites = Object.fromEntries(
        Object.entries(this.variableOverwrites).filter(([, change]) => {
          return !(
            change.meta?.experienceId &&
            experienceIdsToReset.includes(change.meta.experienceId)
          );
        })
      );

      // 2. Clear experience variant index overwrites for these experiences (allows natural variant selection)
      this.experienceVariantIndexOverwrites = Object.fromEntries(
        Object.entries(this.experienceVariantIndexOverwrites).filter(
          ([key]) => !experienceIdsToReset.includes(key)
        )
      );
    }

    // 3. Remove audience override (allows natural audience evaluation)
    const { [id]: _, ...audienceOverwrites } = this.audienceOverwrites;
    this.audienceOverwrites = audienceOverwrites;

    this.onChange();
  }

  // This is exposed to the window api but not used
  public setExperienceVariant({
    experienceId,
    variantIndex,
  }: {
    experienceId: string;
    variantIndex: number;
  }) {
    if (!this.isActiveInstance) {
      return;
    }

    const experience = this.experiences.find(
      (experience) => experience.id === experienceId
    );
    if (!experience) {
      logger.warn(
        `Cannot activate a variant for an unknown experience (id: ${experienceId})`
      );
      return;
    }

    if (
      experience.audience &&
      !this.activeAudiences.some((id) => id === experience.audience?.id)
    ) {
      logger.warn(
        `Cannot activate a variant for an experience (id: ${experienceId}) which is not in the active audiences.`
      );
      return;
    }

    const isValidIndex = experience.components
      .map((component) => component.variants.length + 1)
      .every((length) => length > variantIndex);
    if (!isValidIndex) {
      logger.warn(
        `You activated a variant at index ${variantIndex} for the experience (id: ${experienceId}). Not all components have that many variants, you may see the baseline for some.`
      );
    }

    // Update the experience variant index
    this.experienceVariantIndexOverwrites = {
      ...this.experienceVariantIndexOverwrites,
      [experienceId]: variantIndex,
    };

    this.applyInlineVariableOverridesForExperience(experience, variantIndex);

    // Trigger change notification - this updates the middleware
    this.onChange();
  }

  public resetExperience(experienceId: string) {
    if (!this.isActiveInstance) {
      return;
    }

    const { [experienceId]: _, ...experienceVariantIndexOverwrites } =
      this.experienceVariantIndexOverwrites;
    this.experienceVariantIndexOverwrites = experienceVariantIndexOverwrites;

    this.onChange();
  }

  public reset() {
    if (!this.isActiveInstance) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.ninetailed &&
      typeof window.ninetailed.reset === 'function'
    ) {
      window.ninetailed.reset();
    }
  }
  /**
   * Implements the HasChangesModificationMiddleware interface
   * Returns a middleware function that applies variable overwrites to changes
   */
  public getChangesModificationMiddleware: BuildChangesModificationMiddleware =
    () => {
      if (
        !this.isActiveInstance ||
        (Object.keys(this.variableOverwrites).length === 0 &&
          Object.keys(this.audienceOverwrites).length === 0)
      ) {
        return undefined;
      }

      return ({
        changes: inputChanges,
      }: ChangesModificationMiddlewareArg): ChangesModificationMiddlewareArg => {
        if (!inputChanges || inputChanges.length === 0) {
          return { changes: inputChanges };
        }

        const filteredChanges = inputChanges.filter((change) => {
          const experienceId = change.meta?.experienceId;
          if (!experienceId) return true;

          const experience = this.experiences.find(
            (e) => e.id === experienceId
          );
          if (!experience?.audience?.id) return true;

          return this.audienceOverwrites[experience.audience.id] !== false;
        });

        return { changes: this.getEffectiveChanges(filteredChanges) };
      };
    };

  /**
   * Sets a variable value override for preview
   */
  public setVariableValue({
    experienceId,
    key,
    value,
    variantIndex,
  }: {
    experienceId: string;
    key: string;
    value: AllowedVariableType;
    variantIndex: number;
  }) {
    if (!this.isActiveInstance) {
      return;
    }

    const overrideKey = `${experienceId}:${key}`;

    // Only create new object if actually changing
    if (isEqual(this.variableOverwrites[overrideKey]?.value, value)) {
      return; // No change needed
    }

    const change: Change = {
      type: ChangeTypes.Variable,
      key,
      value,
      meta: {
        experienceId,
        variantIndex,
      },
    };

    // Update variable overwrites
    this.variableOverwrites = {
      ...this.variableOverwrites,
      [overrideKey]: change,
    };

    // Notify listeners
    this.onChangeEmitter.invokeListeners();
    this.onChange();
  }

  public getExperienceSelectionMiddleware: BuildExperienceSelectionMiddleware<
    Reference,
    Reference
  > = ({ baseline, experiences }) => {
    if (!this.isActiveInstance) {
      return;
    }

    return () => {
      const experienceIds = Object.keys(
        this.pluginApi.experienceVariantIndexes
      );
      const experience = experiences.find((experience) => {
        return experienceIds.includes(experience.id);
      });

      if (!experience) {
        return {
          experience: null,
          variant: baseline,
          variantIndex: 0,
        };
      }

      // Handle entry replacements as before
      const entryReplacementComponents = experience.components.filter(
        (component): component is EntryReplacement<Reference> =>
          component.type === ComponentTypeEnum.EntryReplacement &&
          'id' in component.baseline
      );

      const baselineComponent = entryReplacementComponents.find(
        (component) => component.baseline.id === baseline.id
      );

      const variantIndex =
        this.pluginApi.experienceVariantIndexes[experience.id];

      // Continue with entry replacement handling
      if (!baselineComponent) {
        return {
          experience,
          variant: baseline,
          variantIndex: 0,
        };
      }

      const allVariants = [baseline, ...baselineComponent.variants];

      if (allVariants.length <= variantIndex) {
        return {
          experience,
          variant: baseline,
          variantIndex: 0,
        };
      }

      const variant = allVariants[variantIndex];

      if (!variant) {
        return {
          experience,
          variant: baseline,
          variantIndex: 0,
        };
      }

      return {
        experience,
        variant,
        variantIndex,
      };
    };
  };

  public openExperienceEditor(experience: ExperienceConfiguration) {
    if (
      this.onOpenExperienceEditor &&
      typeof this.onOpenExperienceEditor === 'function'
    )
      return this.onOpenExperienceEditor(experience);
  }

  /**
   * @deprecated This method will be removed in a future release. Use `openExperienceEditor` instead to see the experience insights.
   */
  public openExperienceAnalytics(experience: ExperienceConfiguration) {
    logger.warn(
      'The `openExperienceAnalytics` method is deprecated and will be removed in a future release. Use `openExperienceEditor` instead to see the experience insights.'
    );
    window.open(
      `https://app.ninetailed.io/${this.clientId}/${this.environment}/experiences/${experience.id}`,
      '_blank'
    );
  }

  public openAudienceEditor(audience: ExposedAudienceDefinition) {
    if (
      this.onOpenAudienceEditor &&
      typeof this.onOpenAudienceEditor === 'function'
    )
      return this.onOpenAudienceEditor(audience);
  }

  private get pluginApi(): PreviewPluginApi {
    return {
      version: process.env['NX_PACKAGE_VERSION'] || '0.0.0',

      open: this.open.bind(this),
      close: this.close.bind(this),
      toggle: this.toggle.bind(this),
      isOpen: this.isOpen,

      activateAudience: this.activateAudience.bind(this),
      deactivateAudience: this.deactivateAudience.bind(this),
      resetAudience: this.resetAudience.bind(this),

      apiAudiences: this.profile?.audiences || [],
      audienceOverwrites: this.audienceOverwrites,
      activeAudiences: this.activeAudiences,
      audienceDefinitions: this.audienceDefinitions,

      setExperienceVariant: this.setExperienceVariant.bind(this),
      resetExperience: this.resetExperience.bind(this),

      apiExperienceVariantIndexes: this.apiExperienceVariantIndexes,
      experienceVariantIndexes: {
        ...this.experienceVariantIndexes,
        ...this.experienceVariantIndexOverwrites,
      },
      experienceVariantIndexOverwrites: this.experienceVariantIndexOverwrites,

      reset: this.reset.bind(this),

      experiences: this.experiences,

      openExperienceEditor: this.onOpenExperienceEditor
        ? this.openExperienceEditor.bind(this)
        : undefined,

      openExperienceAnalytics: this.openExperienceAnalytics.bind(this),

      openAudienceEditor: this.onOpenAudienceEditor
        ? this.openAudienceEditor.bind(this)
        : undefined,
    };
  }

  private get windowApi() {
    return {
      version: '2.0.0',

      open: this.open.bind(this),
      close: this.close.bind(this),
      toggle: this.toggle.bind(this),

      activateAudience: this.activateAudience.bind(this),
      deactivateAudience: this.deactivateAudience.bind(this),
      resetAudience: this.resetAudience.bind(this),
      activeAudiences: this.activeAudiences,

      setExperienceVariant: this.setExperienceVariant.bind(this),
      resetExperience: this.resetExperience.bind(this),
      experienceVariantIndexes: {
        ...this.experienceVariantIndexes,
        ...this.experienceVariantIndexOverwrites,
      },
      setVariableValue: this.setVariableValue.bind(this),
      variableOverwrites: this.variableOverwrites,
    };
  }

  private isKnownAudience(id: string) {
    return this.potentialAudiences.some((audience) => audience.id === id);
  }

  private get potentialAudiences(): ExposedAudienceDefinition[] {
    const audiencesFromExperiences = this.experiences
      .map((experience) => experience.audience)
      .filter((audience) => !!audience) as ExposedAudienceDefinition[];

    return unionBy(this.audienceDefinitions, audiencesFromExperiences, 'id');
  }

  private get activeAudiences() {
    const deactivatedAudiences = Object.entries(this.audienceOverwrites)
      .filter(([id, active]) => !active)
      .map(([id]) => id);

    const activatedAudiences = Object.entries(this.audienceOverwrites)
      .filter(([id, active]) => active)
      .map(([id]) => id);

    return [...(this.profile?.audiences || []), ...activatedAudiences].filter(
      (id) => !deactivatedAudiences.includes(id)
    );
  }

  private calculateExperienceVariantIndexes(profile: Profile) {
    const matchedExperiences = this.experiences.filter((experience) =>
      isExperienceMatch({
        experience,
        profile,
      })
    );

    return matchedExperiences.reduce((acc, experience) => {
      const distribution = selectDistribution({
        experience,
        profile,
      });

      return {
        ...acc,
        [experience.id]: distribution.index,
      };
    }, {});
  }

  private get apiExperienceVariantIndexes(): Record<string, number> {
    const profile = this.profile;
    if (!profile) {
      return {};
    }
    return this.calculateExperienceVariantIndexes(profile);
  }

  private get experienceVariantIndexes(): Record<string, number> {
    const profile = this.profile;
    if (!profile) {
      return {};
    }

    return this.calculateExperienceVariantIndexes({
      ...profile,
      audiences: this.activeAudiences,
    });
  }

  /**
   * Get the override key for a variable
   */
  private getOverrideKey(experienceId: string, key: string) {
    return `${experienceId}:${key}`;
  }

  /**
   * Ensure inline variables for a given experience reflect the selected variant
   * without triggering multiple onChange calls. Keeps custom flags in sync with forced variants.
   */
  private applyInlineVariableOverridesForExperience(
    experience: ExperienceConfiguration,
    variantIndex: number
  ): boolean {
    let hasChanges = false;
    const overrides = { ...this.variableOverwrites };

    experience.components.forEach((component) => {
      if (component.type !== ComponentTypeEnum.InlineVariable) return;

      const value =
        variantIndex === 0
          ? component.baseline.value
          : component.variants[variantIndex - 1]?.value ??
            component.baseline.value;

      const overrideKey = this.getOverrideKey(experience.id, component.key);
      const previousOverride = overrides[overrideKey];
      const nextChange: Change = {
        type: ChangeTypes.Variable,
        key: component.key,
        value,
        meta: {
          experienceId: experience.id,
          variantIndex,
        },
      };

      if (
        previousOverride &&
        isEqual(previousOverride.value, value) &&
        previousOverride.meta?.variantIndex === variantIndex
      )
        return;

      overrides[overrideKey] = nextChange;
      hasChanges = true;
    });

    if (hasChanges) {
      this.variableOverwrites = overrides;
    }

    return hasChanges;
  }

  /**
   * Get effective changes by applying overwrites - compute on demand
   */
  private getEffectiveChanges(inputChanges: Change[] = this.changes): Change[] {
    if (!inputChanges || Object.keys(this.variableOverwrites).length === 0) {
      return inputChanges || [];
    }

    // Filter out changes that we're overriding
    const filteredChanges = inputChanges.filter((change) => {
      if (change.type !== ChangeTypes.Variable) return true;

      const changeKey = change.meta?.experienceId
        ? this.getOverrideKey(change.meta.experienceId, change.key)
        : change.key;
      return !this.variableOverwrites[changeKey];
    });

    const effectiveChanges = [
      ...filteredChanges,
      ...Object.values(this.variableOverwrites),
    ];

    logger.debug(
      'Overridden changes after applying override:',
      effectiveChanges
    );

    // Add our overrides to create the final result
    return effectiveChanges;
  }

  private onChange = () => {
    logger.debug(
      'Ninetailed Preview Plugin onChange pluginApi:',
      this.pluginApi
    );

    if (typeof window !== 'undefined') {
      window.ninetailed = Object.assign({}, window.ninetailed, {
        plugins: {
          ...window.ninetailed?.plugins,
          preview: this.windowApi,
        },
      });
    }

    this.bridge.updateProps({ props: this.pluginApi });

    this.onChangeEmitter.invokeListeners();
  };

  private onProfileChange = (profile: Profile, changes: Change[] | null) => {
    this.profile = profile;

    logger.debug('Profile changed:', {
      profile,
      changes,
    });

    // If changes are provided, update them
    if (changes) {
      this.onChangesChange(changes);
    }

    this.onChange();
  };

  /**
   * Handles changes from the SDK and applies any variable overrides.
   * This should be called whenever the original changes are updated.
   */
  private onChangesChange = (incomingChanges: Change[]) => {
    if (!this.isActiveInstance) {
      return;
    }

    logger.debug('Received changes:', incomingChanges);

    // Store the original changes
    this.changes = incomingChanges;

    // Notify listeners and update UI
    this.onChange();
  };

  private setCredentials = ({
    clientId,
    environment,
  }: {
    clientId: string;
    environment: string;
  }) => {
    this.clientId = clientId;
    this.environment = environment;
  };
}
