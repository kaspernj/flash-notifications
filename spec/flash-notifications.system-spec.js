// @ts-check

import "velocious/build/src/testing/test.js"
import SystemTest from "system-testing/build/system-test.js"
import SystemTestHelper from "./support/system-test-helper.js"

SystemTest.rootPath = "/?systemTest=true"

const systemTestHelper = new SystemTestHelper()
systemTestHelper.installHooks()

describe("Flash notifications", () => {
  it("dismisses a notification when pressed", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const triggerButton = await systemTest.findByTestID("flashNotifications/showNotification")
      await systemTest.click(triggerButton)

      const notificationMessage = await systemTest.findByTestID("flash-notifications/notification-1/message", {useBaseSelector: false})
      const notificationText = await notificationMessage.getText()
      expect(notificationText).toEqual("Dismiss me")
      const notificationContainer = await systemTest.findByTestID("flash-notifications-notification", {useBaseSelector: false})

      await systemTest.click(notificationContainer)
      await systemTest.waitForNoSelector("[data-testid='flash-notifications-notification']", {useBaseSelector: false})

    })
  })
})
