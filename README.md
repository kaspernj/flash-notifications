# flash-notifications

Flash notifications for React Native and Expo, with a lightweight container component and a simple API for triggering alerts.

## Installation

```
npm install flash-notifications
```

For managed Expo projects, ensure your Expo SDK supports this module and follow the Expo install guidance for modules. For bare React Native projects, install and configure the `expo` package before continuing.

## Setup

Render the notification container once near the root of your app so it can listen for events globally.

```jsx
import React from "react"
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context"
import {Container} from "flash-notifications"

const NotificationsContainer = () => {
  const insets = useSafeAreaInsets()

  return <Container insets={insets} />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationsContainer />
    </SafeAreaProvider>
  )
}
```

If you are not using safe-area insets, render the container directly:

```jsx
import React from "react"
import {Container} from "flash-notifications"

export default function App() {
  return <Container />
}
```

## Usage

Trigger notifications anywhere in your app with the static helpers.

```js
import {FlashNotifications} from "flash-notifications"

FlashNotifications.success("Saved successfully.")
FlashNotifications.error("Something went wrong.")
FlashNotifications.alert("Please check your input.")
```

If you need a custom type, you can use `show` directly.

```js
import {FlashNotifications} from "flash-notifications"

FlashNotifications.show({type: "info", text: "Heads up!"})
```

## API

### FlashNotifications

`FlashNotifications.alert(message)`
Shows an alert notification with a localized "Alert" title.

`FlashNotifications.error(message)`
Shows an error notification with a localized "Error" title.

`FlashNotifications.success(message)`
Shows a success notification with a localized "Success" title.

`FlashNotifications.show({type, text})`
Shows a notification with a localized title based on `type`. Unknown types fall back to the localized "Notification" title.

`FlashNotifications.errorResponse(error)`
Handles Api Maker validation and base errors, converting them into notifications. Unknown errors are logged and rethrown.

Notifications auto-dismiss after 4 seconds and can be dismissed immediately by pressing them.

### Container

`<Container insets={insets} />`
Optional `insets` should be an object with `top`, `right`, and `left` values (for example, from `react-native-safe-area-context`). The container positions itself near the top-right on larger screens and spans the width on small screens.

## Configuration

`configuration.debug`
When `true`, logs lifecycle events such as add/remove, timeout, measurement, and animation events.

`configuration.translate(msgId, {defaultValue})`
Controls localized titles for built-in types. The default implementation returns `defaultValue` or `msgId`.

You can override configuration by mutating the exported object or setting a global before imports:

```js
globalThis.flashNotificationsConfiguration = {
  debug: false,
  translate: (msgId, args) => args?.defaultValue || msgId
}
```

## Debug mode

Enable debug logging by setting the configuration flag at startup.

```js
import {configuration} from "flash-notifications"

configuration.debug = true
```

When enabled, the library logs lifecycle events such as notification creation, press, timeout, measurement, animation start/end, and removal, along with the notification ID.

## API documentation

- Latest stable release: https://docs.expo.dev/versions/latest/sdk/flash-notifications/
- Main branch: https://docs.expo.dev/versions/unversioned/sdk/flash-notifications/

## Contributing

If you need to refresh Expo module generated files locally, run `npm run prepare:module`. Regular `npm install` no longer runs that step automatically.

Before opening or updating a PR, run:

```sh
npm run lint
npm run typecheck
```

The repo's flat ESLint config relies on `react/jsx-uses-vars` so React Native JSX imports are treated as used. If JSX imports such as `View` or `Pressable` start failing `no-unused-vars`, fix the ESLint config rather than rewriting the component render tree.

Contributions are welcome. Please refer to the Expo contributing guide:
https://github.com/expo/expo#contributing
