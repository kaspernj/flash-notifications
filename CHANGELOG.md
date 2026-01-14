# Changelog

## Unreleased
- Add optional debug logging for notification lifecycle events.
- Speed up dismiss animations when notifications are pressed.
- Add notification count dataSet to message container for test hooks.
- Replace StyleSheet usage with inline style objects for notifications.
- Cache inline notification style objects and use numeric font weights.
- Inline cached style assignments directly in notification JSX.
- Build pressable styles with a single cached inline object.
- Switch to responsive-breakpoints for breakpoint handling.
- Switch useEventEmitter import to ya-use-event-emitter.
- Remove @kaspernj/api-maker peer dependency.
- Publish native sources and Expo module config in package files list.
- Bump system-testing dev dependency to 1.0.62.
