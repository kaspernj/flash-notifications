# Agent Notes

- Use .js files instead of .mjs for new test/support files in this repo.
- Keep `react/jsx-uses-vars` enabled in [`eslint.config.js`](/home/dev/Development/flash-notifications/eslint.config.js); this repo's flat ESLint config otherwise treats React Native JSX imports like `View`/`Text`/`Pressable` as unused.
- `prop-types-exact` and `ya-use-event-emitter` currently do not ship usable `.d.ts` files in this repo's installed packages, so prefer narrow import-level `@ts-expect-error` comments instead of broader workarounds.
- When using `responsive-breakpoints` for component styles in this repo, keep `breakpoint.styling(...)` inline on the JSX `style` prop instead of hoisting it into cached style locals or `useMemo`.
