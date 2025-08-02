if (!globalThis.flashNotificationsConfiguration) {
  globalThis.flashNotificationsConfiguration = {
    translate: (msgId, args) => args?.defaultValue || msgId
  }
}

const configuration = globalThis.flashNotificationsConfiguration

export default configuration
