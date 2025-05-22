import EventEmitter from "events"

if (!globalThis.flashNotificationsEvents) {
  globalThis.flashNotificationsEvents = new EventEmitter()
}

export default globalThis.flashNotificationsEvents
