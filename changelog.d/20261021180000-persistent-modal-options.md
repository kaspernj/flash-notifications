Add `persistent` and `presentation` notification options.

- `FlashNotifications.show({type, text, persistent, presentation})` and
  `error()/alert()/success()/errorResponse()` now accept an options object;
  existing message-only calls behave exactly as before.
- `persistent: true` skips the 4 s auto-dismiss timer (same lifetime as an
  activity notification, without the progress bar).
- `presentation: "modal"` renders the notification as a centered card over a
  full-screen backdrop that blocks interaction with the app underneath. It is
  dismissed only via its explicit Dismiss button — backdrop clicks and Escape
  do not dismiss it.
- The modal dialog carries `role="alertdialog"` and `aria-modal` on web, and
  focus moves into the dialog on open and returns to the previously focused
  element on dismiss.
- `expo` is now an optional peer dependency (it is not imported at runtime);
  web consumers alias `react-native$` to `react-native-web` as usual.
