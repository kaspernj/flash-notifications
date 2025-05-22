import configuration from "./configuration"
import Container from "./container"
import FlashNotifications from "./flash-notifications"

if (!configuration) {
  throw new Error("No configuration object given?")
}

export {
  configuration,
  Container,
  FlashNotifications
}
