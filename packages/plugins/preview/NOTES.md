Preview Plugin:

`this.onChange()` -> `this.onChangeEmitter.invokeListeners()`

Ninetailed.ts
`onSelectVariant` receives callback (used in hooks to get variant updates)

listens to `onProfileChange` (which gets called synchronously the first time it's called)
creates `ExperienceSelectMiddleware` by calling `makeExperienceSelectMiddleware`
-> Takes `onChange` callback
-> goes to every plugin, gets `onChangeEmitter`, subscribes to changes and calls `onChange` callback from arguments with `ExperienceSelectMiddleware` when change is triggered

`onChange` calls `buildOverrideMiddleware` with the middleware experience select middleware creating a middleware called `overrideResult`
If there's such a mildleware, calls `setSelectedVariant` with the result of calling the `overrideResult` middleware.

Calls the callback passed to `onSelectVariant`

After wiring that up, synchronously go through current state and create overrides and call `setSelectedVariant`.

## Notes

This seems like an event emitter leak where every time the profile changes we add more and more event emitters that call the override chains
