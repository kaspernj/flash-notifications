// @ts-check

import "velocious/build/src/testing/test.js"
import fs from "node:fs/promises"

import FlashNotifications from "../../src/flash-notifications.js"
import events from "../../src/events.js"

describe("FlashNotifications.activity contract", () => {
  it("pushes an activity notification onto the pushNotification bus", () => {
    const received = []
    const listener = (notification) => received.push(notification)
    events.addListener("pushNotification", listener)

    try {
      FlashNotifications.activity({message: "Syncing..."})
      FlashNotifications.activity({message: "Uploading..."})

      expect(received.length).toEqual(2)
      expect(received[0].type).toEqual("activity")
      expect(received[0].message).toEqual("Syncing...")
      expect(received[1].message).toEqual("Uploading...")
      expect(typeof received[0].id).toEqual("string")
      expect(received[0].id).not.toEqual(received[1].id)
    } finally {
      events.removeListener("pushNotification", listener)
    }
  })

  it("returns a handle with callable update, succeed, fail and done methods", () => {
    const controlEvents = []
    const listener = (detail) => controlEvents.push(detail)
    events.addListener("activityNotification", listener)

    try {
      const handle = FlashNotifications.activity({message: "Syncing..."})

      expect(typeof handle.update).toEqual("function")
      expect(typeof handle.succeed).toEqual("function")
      expect(typeof handle.fail).toEqual("function")
      expect(typeof handle.done).toEqual("function")
      expect(handle.update.length).toEqual(0)
      expect(handle.succeed.length).toEqual(1)
      expect(handle.fail.length).toEqual(1)
      expect(handle.done.length).toEqual(0)

      handle.update()
      handle.update({progress: 0.5})
      handle.succeed("Done")
      handle.fail()
      handle.done()

      expect(controlEvents.length).toEqual(5)
      expect(controlEvents.every((detail) => typeof detail.id == "string")).toEqual(true)
      expect(controlEvents[0].action).toEqual("update")
      expect(controlEvents[0].progress).toBeUndefined()
      expect(controlEvents[1].action).toEqual("update")
      expect(controlEvents[1].progress).toEqual(0.5)
      expect(controlEvents[2].action).toEqual("succeed")
      expect(controlEvents[2].message).toEqual("Done")
      expect(controlEvents[3].action).toEqual("fail")
      expect(controlEvents[3].message).toBeUndefined()
      expect(controlEvents[4].action).toEqual("done")
    } finally {
      events.removeListener("activityNotification", listener)
    }
  })

  it("clamps update progress to [0, 1] and ignores non-number values", () => {
    const controlEvents = []
    const listener = (detail) => controlEvents.push(detail)
    events.addListener("activityNotification", listener)

    try {
      const handle = FlashNotifications.activity({message: "Syncing..."})

      handle.update({progress: 1.5})
      handle.update({progress: -0.5})
      handle.update({progress: NaN})
      handle.update({progress: "0.5"})

      expect(controlEvents.length).toEqual(4)
      expect(controlEvents[0].progress).toEqual(1)
      expect(controlEvents[1].progress).toEqual(0)
      expect(controlEvents[2].progress).toBeUndefined()
      expect(controlEvents[3].progress).toBeUndefined()
    } finally {
      events.removeListener("activityNotification", listener)
    }
  })

  it("never gives activity notifications the 4000ms auto-dismiss timeout", async () => {
    const containerSource = await fs.readFile(new URL("../../src/container/index.jsx", import.meta.url), "utf8")
    const notificationSource = await fs.readFile(new URL("../../src/container/notification.jsx", import.meta.url), "utf8")

    expect(containerSource).toContain('type == "activity" ? undefined : setTimeout(')
    expect(containerSource).toContain('"activityNotification"')
    // The succeed/fail actions must map onto the canonical success/error
    // tones so the dismiss flash actually changes the card tone.
    expect(containerSource).toContain('detail.action == "succeed" ? "success" : "error"')
    // Activity cards need a dark tone so the white title and message stay
    // readable on light application backgrounds.
    expect(notificationSource).toContain("rgba(30, 41, 59, 0.87)")
    expect(notificationSource).toContain("rgba(30, 41, 59, 0.95)")
    expect(containerSource).toContain('type == "activity" && detail.id == undefined')
    expect(notificationSource).toContain('testID="flash-notifications-notification-bar"')
    expect(notificationSource).toContain('testID="flash-notifications-notification-bar-fill"')
  })
})
