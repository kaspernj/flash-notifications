if (!globalThis.flashNotificationsConfiguration) {
  globalThis.flashNotificationsConfiguration = {
    debug: false,
    translate: (msgId, args) => args?.defaultValue || msgId
  }
}

const configuration = globalThis.flashNotificationsConfiguration

export default configuration
