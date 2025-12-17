// @ts-check

import BaseError from "@kaspernj/api-maker/build/base-error.js"
import ValidationError from "@kaspernj/api-maker/build/validation-error.js"
import {digg} from "diggerize"

import configuration from "./configuration.js"
import events from "./events.js"

export default class FlashNotifications {
  /**
   * @param {string} message
   * @returns {void}
   */
  static alert(message) {
    FlashNotifications.show({type: "alert", text: message})
  }

  /**
   * @param {string} message
   * @returns {void}
   */
  static error(message) {
    FlashNotifications.show({type: "error", text: message})
  }

  /**
   * @param {Error} error
   * @returns {void}
   */
  static errorResponse(error) {
    if (error instanceof ValidationError) {
      // @ts-expect-error
      if (error.hasUnhandledErrors()) {
        // @ts-expect-error
        const unhandledErrorMessages = error.getUnhandledErrors().map((subError) => subError.getFullErrorMessages()).flat()

        FlashNotifications.error(unhandledErrorMessages.join(". "))
      } else {
        const defaultValue = "Couldn't submit because of validation errors."

        FlashNotifications.alert(configuration.translate("js.notification.couldnt_submit_because_of_validation_errors", {defaultValue}))
      }
    } else if (error instanceof BaseError) {
      // @ts-expect-error
      if (error.args.response && error.args.response.errors) {
        const errors = /** @type {Array<string | {message: string}[]>} */ (digg(error, "args", "response", "errors"))
        const errorMessages = errors.map((error) => {
          if (typeof error == "string") {
            return error
          }

          return digg(error, "message")
        })

        FlashNotifications.error(errorMessages.join(". "))
      } else {
        throw error
      }
    } else {
      console.error(`Didnt know what to do with that ${error.constructor.name}: ${error.message}`)
      throw error
    }
  }

  /**
   * @param {string} message
   * @returns {void}
   */
  static success(message) {
    FlashNotifications.show({type: "success", text: message})
  }

  /**
   * @param {object} args
   * @param {string} args.text
   * @param {string} args.type
   * @returns {void}
   */
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
