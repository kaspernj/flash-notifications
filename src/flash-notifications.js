import BaseError from "@kaspernj/api-maker/build/base-error"
import ValidationError from "@kaspernj/api-maker/build/validation-error"
import {digg} from "diggerize"

import configuration from "./configuration"
import events from "./events"

export default class FlashNotifications {
  static alert(message) {
    FlashNotifications.show({type: "alert", text: message})
  }

  static error(error) {
    if (error instanceof BaseError) {
      if (error.args.response && error.args.response.errors) {
        const errors = digg(error, "args", "response", "errors")
        const errorMessages = errors.map((error) => {
          if (typeof error == "string") {
            return error
          }

          return digg(error, "message")
        })

        FlashNotifications.alert(errorMessages.join(". "))
      } else {
        throw error
      }
    } else if (error instanceof ValidationError) {
      if (error.hasUnhandledErrors()) {
        FlashNotifications.alert(error.message)
      } else {
        const defaultValue = "Couldn't submit because of validation errors."

        FlashNotifications.alert(configuration.translate("js.notification.couldnt_submit_because_of_validation_errors", {defaultValue}))
      }
    } else {
      console.error("Didnt know what to do with that error", error)
      throw error
    }
  }

  static errorResponse(error) {
    this.error(error)
  }

  static success(message) {
    FlashNotifications.show({type: "success", text: message})
  }

  static show(args) {
    let title

    if (args.type == "alert") {
      title = configuration.translate("js.shared.alert", {defaultValue: "Alert"})
    } else if (args.type == "error") {
      title = configuration.translate("js.shared.error", {defaultValue: "Error"})
    } else if (args.type == "success") {
      title = configuration.translate("js.shared.success", {defaultValue: "Success"})
    } else {
      title = configuration.translate("js.shared.notification", {defaultValue: "Notification"})
    }

    events.emit("pushNotification", {
      message: args.text,
      title,
      type: args.type
    })
  }
}
