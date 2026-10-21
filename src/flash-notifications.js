// @ts-check

import {digg} from "diggerize"

import configuration from "./configuration.js"
import events from "./events.js"

/**
 * @typedef {object} ActivityArgs
 * @property {string} message Translated display string shown while the activity runs.
 */

/**
 * @typedef {object} ActivityUpdateArgs
 * @property {number=} progress Determinate progress in [0, 1]. Omit to keep the bar indeterminate.
 */

/**
 * @typedef {object} ActivityHandle
 * @property {(args?: ActivityUpdateArgs) => void} update Moves the loading bar; without a progress value it stays indeterminate.
 * @property {(message?: string) => void} succeed Flashes the success tone, then dismisses the notification.
 * @property {(message?: string) => void} fail Flashes the error tone, then dismisses the notification.
 * @property {() => void} done Dismisses the notification without a tone change.
 */

/**
 * @typedef {object} NotificationOptions
 * @property {boolean=} persistent When true the notification never auto-dismisses. It stays on
 *   screen until it is dismissed, just like an activity notification, but without a progress bar.
 * @property {"toast" | "modal"=} presentation "toast" (the default) renders the notification in the
 *   usual stacked toast container. "modal" renders it as a centered dialog over a backdrop that
 *   blocks interaction with the app underneath; it can only be left via its explicit dismiss
 *   button.
 */

let activityNotificationCount = 0

export default class FlashNotifications {
  /**
   * @param {string} message
   * @param {NotificationOptions} [options]
   * @returns {void}
   */
  static alert(message, options) {
    FlashNotifications.show({type: "alert", text: message, ...options})
  }

  /**
   * @param {string} message
   * @param {NotificationOptions} [options]
   * @returns {void}
   */
  static error(message, options) {
    FlashNotifications.show({type: "error", text: message, ...options})
  }

  /**
   * @param {unknown} error
   * @param {NotificationOptions} [options]
   * @returns {void}
   */
  static errorResponse(error, options) {
    if (!(error instanceof Error)) {
      FlashNotifications.error(typeof error == "string" ? error : String(error), options)

      return
    }

    // @ts-expect-error
    if (error.apiMakerType == "ValidationError") {
      // @ts-expect-error
      if (error.hasUnhandledErrors()) {
        // @ts-expect-error
        const unhandledErrorMessages = error.getUnhandledErrors().map((subError) => subError.getFullErrorMessages()).flat()

        FlashNotifications.error(unhandledErrorMessages.join(". "), options)
      } else {
        const defaultValue = "Couldn't submit because of validation errors."

        FlashNotifications.alert(configuration.translate("js.notification.couldnt_submit_because_of_validation_errors", {defaultValue}), options)
      }
    // @ts-expect-error
    } else if (error.apiMakerType == "BaseError") {
      // @ts-expect-error
      const response = error.args && error.args.response
      const errors = /** @type {Array<string | {message: string}[]> | undefined} */ (response && response.errors)

      if (errors) {
        const errorMessages = errors.map((error) => {
          if (typeof error == "string") {
            return error
          }

          return digg(error, "message")
        })

        FlashNotifications.error(errorMessages.join(". "), options)
      } else if (error.message) {
        FlashNotifications.error(error.message, options)
      } else {
        FlashNotifications.error(configuration.translate("js.shared.something_went_wrong", {defaultValue: "Something went wrong."}), options)
      }
    } else {
      const constructorName = digg(error, "constructor", "name")
      const defaultErrorMessage = configuration.translate("js.shared.something_went_wrong", {defaultValue: "Something went wrong."})
      const message = digg(error, "message")

      console.error(`Didnt know what to do with that ${constructorName}: ${message}`)
      FlashNotifications.error(defaultErrorMessage, options)
    }
  }

  /**
   * @param {string} message
   * @param {NotificationOptions} [options]
   * @returns {void}
   */
  static success(message, options) {
    FlashNotifications.show({type: "success", text: message, ...options})
  }

  /**
   * Shows a long-running activity notification with a loading bar. Unlike the
   * other notification types it never auto-dismisses: the returned handle
   * decides when the notification leaves the screen.
   *
   * @param {ActivityArgs} args
   * @returns {ActivityHandle}
   */
  static activity({message}) {
    activityNotificationCount += 1
    const id = `activity-${activityNotificationCount}`

    events.emit("pushNotification", {
      id,
      message,
      title: configuration.translate("js.shared.activity", {defaultValue: "Activity"}),
      type: "activity"
    })

    /**
     * @param {"update" | "succeed" | "fail" | "done"} action
     * @param {object} [payload]
     * @returns {void}
     */
    const emitControl = (action, payload = {}) => {
      events.emit("activityNotification", {action, id, ...payload})
    }

    return {
      /**
       * @param {ActivityUpdateArgs} [args]
       * @returns {void}
       */
      update(args = {}) {
        const {progress} = args
        const normalizedProgress = typeof progress == "number" && !Number.isNaN(progress)
          ? Math.min(1, Math.max(0, progress))
          : undefined

        emitControl("update", {progress: normalizedProgress})
      },

      succeed(message) {
        emitControl("succeed", {message})
      },

      fail(message) {
        emitControl("fail", {message})
      },

      done() {
        emitControl("done")
      }
    }
  }

  /**
   * @param {object} args
   * @param {string} args.text
   * @param {string} args.type
   * @param {boolean=} args.persistent
   * @param {"toast" | "modal"=} args.presentation
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
      persistent: args.persistent,
      presentation: args.presentation,
      title,
      type: args.type
    })
  }
}
