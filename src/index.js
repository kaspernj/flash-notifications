// @ts-check

import configuration from "./configuration.js"
import Container from "./container"
import FlashNotifications from "./flash-notifications.js"

if (!configuration) {
  throw new Error("No configuration object given?")
}

export {
  configuration,
  Container,
  FlashNotifications
}
