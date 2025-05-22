import BaseError from "@kaspernj/api-maker/src/base-error"
import ValidationError from "@kaspernj/api-maker/src/validation-error"
import {digg} from "diggerize"

export default class FlashMessage {
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
        FlashMessage.alert(I18n.t("js.notification.couldnt_submit_because_of_validation_errors")) // eslint-disable-line no-undef
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
      title = I18n.t("js.shared.alert") // eslint-disable-line no-undef
    } else if (args.type == "error") {
      title = I18n.t("js.shared.error") // eslint-disable-line no-undef
    } else if (args.type == "success") {
      title = I18n.t("js.shared.success") // eslint-disable-line no-undef
    } else {
      title = I18n.t("js.shared.notification") // eslint-disable-line no-undef
    }

    const event = new CustomEvent("pushNotification", {
      detail: {
        message: args.text,
        title,
        type: args.type
      }
    })

    globalThis.dispatchEvent(event)
  }
}
