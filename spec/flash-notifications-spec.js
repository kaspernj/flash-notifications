// @ts-check

import "velocious/build/src/testing/test.js"
import SystemTest from "system-testing/build/system-test.js"
import SystemTestHelper from "./support/system-test-helper.js"
import wait from "awaitery/build/wait.js"

SystemTest.rootPath = "/?systemTest=true"

const systemTestHelper = new SystemTestHelper()
systemTestHelper.installHooks()

describe("Flash notifications", () => {
  it("dismisses a notification when pressed", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const triggerButton = await systemTest.findByTestID("flashNotifications/showNotification")
      await systemTest.click(triggerButton)

      const notificationMessage = await systemTest.findByTestID("notification-message", {useBaseSelector: false})
      const notificationText = await notificationMessage.getText()
      expect(notificationText).toEqual("Dismiss me")
      const notificationContainer = await systemTest.findByTestID("flash-notifications-notification", {useBaseSelector: false})

      await systemTest.click(notificationContainer)
      await systemTest.expectNoElement("[data-testid='flash-notifications-notification']", {useBaseSelector: false})
    })
  })

  it("auto dismisses a notification after a delay", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const triggerButton = await systemTest.findByTestID("flashNotifications/showNotification")
      await systemTest.click(triggerButton)

      const notificationMessage = await systemTest.findByTestID("notification-message", {useBaseSelector: false})
      const notificationText = await notificationMessage.getText()
      expect(notificationText).toEqual("Dismiss me")

      await wait(4500)
      await systemTest.expectNoElement("[data-testid='notification-message']", {useBaseSelector: false})
    })
  })
})
