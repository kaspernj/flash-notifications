// @ts-check

import "velocious/build/src/testing/test.js"

import FlashNotifications from "../../src/flash-notifications.js"
import events from "../../src/events.js"

describe("FlashNotifications persistent/modal options contract", () => {
  /** @type {any[]} */
  let received = []
  /** @type {(notification: any) => void} */
  let listener

  beforeEach(() => {
    received = []
    listener = /** @param {any} notification */ (notification) => received.push(notification)
    events.addListener("pushNotification", listener)
  })

  afterEach(() => {
    events.removeListener("pushNotification", listener)
  })

  it("show passes persistent and presentation through to the pushNotification bus", () => {
    FlashNotifications.show({
      persistent: true,
      presentation: "modal",
      text: "Registration could not be saved.",
      type: "error"
    })

    expect(received.length).toEqual(1)
    expect(received[0].persistent).toEqual(true)
    expect(received[0].presentation).toEqual("modal")
    expect(received[0].type).toEqual("error")
    expect(received[0].message).toEqual("Registration could not be saved.")
  })

  it("show without options keeps the existing payload shape (backward compatibility)", () => {
    FlashNotifications.show({text: "Saved", type: "success"})

    expect(received.length).toEqual(1)
    expect(received[0].persistent).toBeUndefined()
    expect(received[0].presentation).toBeUndefined()
    expect(received[0].type).toEqual("success")
    expect(received[0].message).toEqual("Saved")
  })

  it("error/alert/success accept an options object and pass it through", () => {
    FlashNotifications.error("Save failed", {persistent: true, presentation: "modal"})
    FlashNotifications.alert("Check your input", {persistent: true})
    FlashNotifications.success("Saved", {presentation: "toast"})

    expect(received.length).toEqual(3)
    expect(received[0].persistent).toEqual(true)
    expect(received[0].presentation).toEqual("modal")
    expect(received[1].persistent).toEqual(true)
    expect(received[1].presentation).toBeUndefined()
    expect(received[2].persistent).toBeUndefined()
    expect(received[2].presentation).toEqual("toast")
  })

  it("message-only calls still work unchanged", () => {
    FlashNotifications.error("Boom")
    FlashNotifications.alert("Hey")
    FlashNotifications.success("Nice")

    expect(received.length).toEqual(3)
    expect(received.map((notification) => notification.type)).toEqual(["error", "alert", "success"])
    expect(received.every((notification) => notification.persistent == undefined)).toEqual(true)
    expect(received.every((notification) => notification.presentation == undefined)).toEqual(true)
  })
})
