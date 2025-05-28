if (!globalThis.flashNotificationsConfiguration) {
  globalThis.flashNotificationsConfiguration = {
    translate: (msgId) => msgId
  }
}

const configuration = globalThis.flashNotificationsConfiguration

export default configuration
