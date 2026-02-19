import { selectPluginsHavingExperienceSelectionMiddleware } from './selectPluginsHavingExperienceSelectionMiddleware';
describe('selectPluginsHavingExperienceSelectionMiddleware', () => {
  it('should return an array of plugins having an experience selection middleware', () => {
    const plugin1 = {
      getExperienceSelectionMiddleware: () => {
        return () => {
          return {
            experience: 'experience',
            variant: 'variant',
          };
        };
      },
    };
    const plugin2 = {
      getExperienceSelectionMiddleware: () => {
        return () => {
          return {
            experience: 'experience',
            variant: 'variant',
          };
        };
      },
    };
    const plugin3 = {};
    const plugins = [plugin1, plugin2, plugin3];
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectPluginsHavingExperienceSelectionMiddleware(plugins as any)
    ).toEqual([plugin1, plugin2]);
  });
});
