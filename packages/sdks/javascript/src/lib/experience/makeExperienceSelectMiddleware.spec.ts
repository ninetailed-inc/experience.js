import { OnChangeEmitter } from '../utils/OnChangeEmitter';
import { makeExperienceSelectMiddleware } from './makeExperienceSelectMiddleware';

describe('makeExperienceSelectMiddleware', () => {
  describe('middleware', () => {
    it('should return a pass-through middleware when profile is null', () => {
      const plugins: any = [
        {
          getExperienceSelectionMiddleware: () => {
            /* noop */
          },
        },
        {
          getExperienceSelectionMiddleware: () => {
            /* noop */
          },
        },
      ];

      const { middleware } = makeExperienceSelectMiddleware({
        plugins,
        onChange: () => {
          /* noop */
        },
        experiences: [],
        baseline: {
          id: 'baseline',
        },
        profile: null,
      });

      const experience = {
        id: 'experience',
        type: 'nt_experiment' as const,
        components: [],
        distribution: [],
        trafficAllocation: 1,
      };

      const variant = {
        id: 'variant',
      };

      const middlewareResult = middleware({
        experience,
        variant,
        variantIndex: 0,
      });

      expect(middlewareResult).toEqual({
        experience,
        variant,
        variantIndex: 0,
      });
    });

    it('should return a piped middleware when profile is not null', () => {
      const experience1 = {
        id: 'experience1',
        type: 'nt_experiment' as const,
        components: [],
        distribution: [],
        trafficAllocation: 1,
      };

      const variant1 = {
        id: 'variant1',
      };

      const experience2 = {
        id: 'experience2',
        type: 'nt_experiment' as const,
        components: [],
        distribution: [],
        trafficAllocation: 1,
      };

      const variant2 = {
        id: 'variant2',
      };

      const plugins: any = [
        {
          getExperienceSelectionMiddleware: () => () => ({
            experience: experience1,
            variant: variant1,
            variantIndex: 0,
          }),
        },
        {
          getExperienceSelectionMiddleware: () => () => ({
            experience: experience2,
            variant: variant2,
            variantIndex: 1,
          }),
        },
      ];

      const { middleware } = makeExperienceSelectMiddleware({
        plugins,
        onChange: () => {
          /* noop */
        },
        experiences: [],
        baseline: {
          id: 'baseline',
        },
        profile: {
          id: 'profile',
        } as any,
      });

      const experience = {
        id: 'experience',
        type: 'nt_experiment' as const,
        components: [],
        distribution: [],
        trafficAllocation: 1,
      };

      const variant = {
        id: 'variant',
      };

      const middlewareResult = middleware({
        experience,
        variant,
        variantIndex: 0,
      });

      expect(middlewareResult).toEqual({
        experience: experience2,
        variant: variant2,
        variantIndex: 1,
      });
    });
  });

  describe('addListeners', () => {
    it('should invoke onChange when a plugin with onChangeEmitter is changed', () => {
      const onChange = jest.fn();
      const plugins: any = [
        {
          onChangeEmitter: new OnChangeEmitter(),
        },
        {
          onChangeEmitter: new OnChangeEmitter(),
        },
      ];

      jest.spyOn(plugins[0].onChangeEmitter, 'addListener');
      jest.spyOn(plugins[1].onChangeEmitter, 'addListener');

      const { addListeners } = makeExperienceSelectMiddleware({
        plugins,
        onChange,
        experiences: [],
        baseline: {
          id: 'baseline',
        },
        profile: {
          id: 'profile',
        } as any,
      });

      addListeners();

      expect(plugins[0].onChangeEmitter.addListener).toHaveBeenCalledTimes(1);
      expect(plugins[1].onChangeEmitter.addListener).toHaveBeenCalledTimes(1);

      plugins[0].onChangeEmitter.invokeListeners();
      plugins[1].onChangeEmitter.invokeListeners();

      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeListeners', () => {
    it('should not invoke onChange once listener are removed', () => {
      const onChange = jest.fn();
      const plugins: any = [
        {
          onChangeEmitter: new OnChangeEmitter(),
        },
        {
          onChangeEmitter: new OnChangeEmitter(),
        },
      ];

      const { addListeners, removeListeners } = makeExperienceSelectMiddleware({
        plugins,
        onChange,
        experiences: [],
        baseline: {
          id: 'baseline',
        },
        profile: {
          id: 'profile',
        } as any,
      });

      addListeners();

      removeListeners();

      plugins[0].onChangeEmitter.invokeListeners();

      expect(onChange).not.toHaveBeenCalled();

      plugins[1].onChangeEmitter.invokeListeners();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
