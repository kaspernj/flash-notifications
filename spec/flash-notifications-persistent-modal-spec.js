// @ts-check

import "velocious/build/src/testing/test.js"
import {Key} from "selenium-webdriver"
import SystemTest from "system-testing/build/system-test.js"
import SystemTestHelper from "./support/system-test-helper.js"
import wait from "awaitery/build/wait.js"

SystemTest.rootPath = "/?systemTest=true"

const systemTestHelper = new SystemTestHelper()
systemTestHelper.installHooks()

/**
 * @param {SystemTest} systemTest
 * @param {string} testID
 * @returns {Promise<boolean>}
 */
const isPresent = async (systemTest, testID) => {
  try {
    const element = await systemTest.findNoWait(`[data-testid='${testID}']`, {useBaseSelector: false})

    return await element.isDisplayed()
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Element couldn't be found after ") || error.message.includes("stale element"))) {
      return false
    }

    throw error
  }
}

describe("Flash notifications persistent and modal presentation", () => {
  it("keeps a persistent notification on screen after the 4 s auto-dismiss window", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const triggerButton = await systemTest.findByTestID("flashNotifications/showPersistentToast")
      await systemTest.click(triggerButton)

      const notificationMessage = await systemTest.findByTestID("notification-message", {useBaseSelector: false})
      expect(await notificationMessage.getText()).toEqual("This one stays until dismissed.")

      // The plain-toast auto-dismiss timer fires at 4 s; a persistent
      // notification must still be there well after that.
      await wait(5500)
      expect(await isPresent(systemTest, "flash-notifications-notification")).toEqual(true)

      // Pressing it dismisses it like any other notification.
      const notificationContainer = await systemTest.findByTestID("flash-notifications-notification", {useBaseSelector: false})
      await systemTest.click(notificationContainer)
      await systemTest.waitForNoSelector("[data-testid='flash-notifications-notification']", {useBaseSelector: false})
    })
  })

  it("renders a modal with backdrop and dismiss button, blocks the app underneath, and dismisses only via the button", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const triggerButton = await systemTest.findByTestID("flashNotifications/showPersistentModal")
      await systemTest.click(triggerButton)

      const card = await systemTest.findByTestID("flash-notifications-notification", {useBaseSelector: false})
      expect(await card.isDisplayed()).toEqual(true)

      // Web accessibility contract on the dialog itself.
      expect(await card.getAttribute("role")).toEqual("alertdialog")
      expect(await card.getAttribute("aria-modal")).toEqual("true")

      const notificationMessage = await systemTest.findByTestID("notification-message", {useBaseSelector: false})
      expect(await notificationMessage.getText()).toEqual("Registration could not be saved.")

      // The backdrop covers the viewport and the overlay swallows pointer
      // events, so the app underneath cannot be clicked while the modal is up.
      const backdrop = await systemTest.findByTestID("flash-notifications-modal-backdrop", {useBaseSelector: false})
      expect(await backdrop.isDisplayed()).toEqual(true)
      const backdropRect = await backdrop.getRect()
      expect(backdropRect.width).toBeGreaterThan(300)
      expect(backdropRect.height).toBeGreaterThan(300)

      const overlay = await systemTest.findByTestID("flash-notifications/modal-overlay", {useBaseSelector: false})
      expect(await overlay.getCssValue("pointer-events")).toEqual("auto")

      // Clicking the backdrop must NOT dismiss the modal.
      await systemTest.click(backdrop)
      expect(await isPresent(systemTest, "flash-notifications-notification")).toEqual(true)

      // Escape must NOT dismiss the modal either.
      await systemTest.getDriver().actions().keyDown(Key.ESCAPE).keyUp(Key.ESCAPE).perform()
      await wait(500)
      expect(await isPresent(systemTest, "flash-notifications-notification")).toEqual(true)

      // It survives the 4 s auto-dismiss window as well.
      await wait(4500)
      expect(await isPresent(systemTest, "flash-notifications-notification")).toEqual(true)

      // The explicit dismiss button is the only way out.
      const dismissButton = await systemTest.findByTestID("flash-notifications-modal-dismiss", {useBaseSelector: false})
      expect(await dismissButton.getText()).toEqual("Dismiss")
      await systemTest.click(dismissButton)
      await systemTest.waitForNoSelector("[data-testid='flash-notifications-notification']", {useBaseSelector: false})
      await systemTest.waitForNoSelector("[data-testid='flash-notifications-modal-backdrop']", {useBaseSelector: false})
    })
  })

  it("keeps the default toast presentation auto-dismissing after 4 s", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const triggerButton = await systemTest.findByTestID("flashNotifications/showNotification")
      await systemTest.click(triggerButton)

      const notificationMessage = await systemTest.findByTestID("notification-message", {useBaseSelector: false})
      expect(await notificationMessage.getText()).toEqual("Dismiss me")

      // A plain toast is still a toast: no modal overlay appears for it.
      expect(await isPresent(systemTest, "flash-notifications/modal-overlay")).toEqual(false)

      await wait(4500)
      await systemTest.waitForNoSelector("[data-testid='notification-message']", {useBaseSelector: false})
    })
  })
})
