// @ts-check

import {describe, expect, it} from "velocious/build/src/testing/test.js"
import FlashNotificationsListener from "../src/listener.js"
import FlashNotifications from "../src/flash-notifications.js"

describe("FlashNotifications.errorResponse", () => {
  it("shows the given string when error is a string", () => {
    const listener = FlashNotificationsListener.current()

    listener.notifications = []
    FlashNotifications.errorResponse("Plain failure")

    expect(listener.notifications.length).toEqual(1)
    expect(listener.notifications[0].message).toEqual("Plain failure")
    expect(listener.notifications[0].type).toEqual("error")
  })

  it("stringifies non-error values", () => {
    const listener = FlashNotificationsListener.current()

    listener.notifications = []
    FlashNotifications.errorResponse(404)

    expect(listener.notifications.length).toEqual(1)
    expect(listener.notifications[0].message).toEqual("404")
    expect(listener.notifications[0].type).toEqual("error")
  })

  it("shows generic error for unknown Error objects", () => {
    const listener = FlashNotificationsListener.current()
    const originalConsoleError = console.error

    listener.notifications = []
    console.error = () => {}

    try {
      FlashNotifications.errorResponse(new Error("Boom"))
    } finally {
      console.error = originalConsoleError
    }

    expect(listener.notifications.length).toEqual(1)
    expect(listener.notifications[0].message).toEqual("Something went wrong.")
    expect(listener.notifications[0].type).toEqual("error")
  })

  it("shows the error message for BaseError objects without response errors", () => {
    const listener = FlashNotificationsListener.current()
    const error = new Error("Delete failed")

    // @ts-expect-error
    error.apiMakerType = "BaseError"

    listener.notifications = []
    FlashNotifications.errorResponse(error)

    expect(listener.notifications.length).toEqual(1)
    expect(listener.notifications[0].message).toEqual("Delete failed")
    expect(listener.notifications[0].type).toEqual("error")
  })
})
