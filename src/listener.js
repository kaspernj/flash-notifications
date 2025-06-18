import events from "./events.js"

export default class FlashNotificationsListener {
  notifications = []

  static current() {
    if (!globalThis.flashNotificationsListener) {
      globalThis.flashNotificationsListener = new FlashNotificationsListener()

      globalThis.flashNotificationsListener.connect(events)
    }

    return globalThis.flashNotificationsListener
  }

  connect(events) {
    events.addListener("pushNotification", this.onPushNotification)
  }

  findAndPop(argument) {
    for (const notificationIndex in this.notifications) {
      const notification = this.notifications[notificationIndex]
      let result

      if (typeof argument == "function") {
        result = argument(notification)
      } else if (typeof argument == "object") {
        let allEqual = true

        for (const key in argument) {
          const value = argument[key]

          if (value !== notification[key]) {
            allEqual = false
          }
        }

        result = allEqual
      } else {
        throw new Error(`Unknown type of argument: ${typeof argument}`)
      }

      if (result) {
        delete this.notifications[notificationIndex]

        return notification
      }
    }

    throw new Error(`Couldn't find the expected notification in: ${JSON.stringify(this.notifications)}`)
  }

  onPushNotification = (notification) => {
    this.notifications.push(notification)
  }
}
