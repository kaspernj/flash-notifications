import {EventEmitter} from "eventemitter3"

if (!globalThis.flashNotificationsEvents) {
  globalThis.flashNotificationsEvents = new EventEmitter()
}

export default globalThis.flashNotificationsEvents
