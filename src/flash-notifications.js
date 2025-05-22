import BaseError from "@kaspernj/api-maker/src/base-error"
import configuration from "./configuration"
import events from "./events"
import ValidationError from "@kaspernj/api-maker/src/validation-error"
import {digg} from "diggerize"

export default class FlashNotifications {
  static alert(message) {
    FlashMessage.show({type: "alert", text: message})
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

        FlashMessage.alert(errorMessages.join(". "))
      } else {
        throw error
      }
    } else if (error instanceof ValidationError) {
      if (error.hasUnhandledErrors()) {
        FlashMessage.alert(error.message)
      } else {
        const defaultValue = "Couldn't submit because of validation errors."

        FlashMessage.alert(configuration.translate("js.notification.couldnt_submit_because_of_validation_errors", {defaultValue}))
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
    FlashMessage.show({type: "success", text: message})
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
