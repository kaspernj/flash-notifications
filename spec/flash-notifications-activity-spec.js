// @ts-check

import "velocious/build/src/testing/test.js"
import {error as SeleniumError} from "selenium-webdriver"
import SystemTest from "system-testing/build/system-test.js"
import SystemTestHelper from "./support/system-test-helper.js"
import wait from "awaitery/build/wait.js"

SystemTest.rootPath = "/?systemTest=true"

const systemTestHelper = new SystemTestHelper()
systemTestHelper.installHooks()

describe("Flash notifications activity", () => {
  it("keeps a loading bar on screen while working and removes it after success", async () => {
    await SystemTest.run(async (systemTest) => {
      await systemTest.visit("/")

      const activityTone = "rgba(30, 41, 59, 0.87)"
      const successTone = "rgba(0, 0, 0, 0.87)"

      const triggerButton = await systemTest.findByTestID("flashNotifications/showActivity")
      const startedAt = Date.now()
      await systemTest.click(triggerButton)

      // While the activity runs, the card (with its readable activity tone,
      // not a transparent background) and its loading bar are on screen
      const notification = await systemTest.findByTestID("flash-notifications-notification", {useBaseSelector: false})
      expect(await notification.isDisplayed()).toEqual(true)
      expect(await notification.getCssValue("backgroundColor")).toEqual(activityTone)
      const bar = await systemTest.findByTestID("flash-notifications-notification-bar", {useBaseSelector: false})
      expect(await bar.isDisplayed()).toEqual(true)
      const trackRect = await bar.getRect()

      // The progress update lands 500ms after the start: wait until the fill
      // switches from the 30% indeterminate sweep to the determinate 50% width
      const deadline = startedAt + 1550
      let fillRatio = 0

      do {
        await wait(100)

        try {
          const fill = await systemTest.findNoWait("[data-testid='flash-notifications-notification-bar-fill']", {useBaseSelector: false})
          fillRatio = (await fill.getRect()).width / trackRect.width
        } catch (error) {
          // The indeterminate-to-determinate switch re-renders the fill and
          // makes the previous element handle stale
          if (error instanceof SeleniumError.StaleElementReferenceError) continue
          throw error
        }
      } while (fillRatio < 0.4 && Date.now() < deadline)

      expect(fillRatio).toBeGreaterThan(0.4)
      expect(fillRatio).toBeLessThan(0.6)

      // succeed() flashes the success tone during the ~200ms dismiss fade:
      // poll the card until the tone switches (or the card is gone)
      let observedTone = activityTone
      let cardGone = false
      const toneDeadline = startedAt + 4000

      while (!cardGone && observedTone != successTone && Date.now() < toneDeadline) {
        try {
          const card = await systemTest.findNoWait("[data-testid='flash-notifications-notification']", {useBaseSelector: false})
          observedTone = await card.getCssValue("backgroundColor")
        } catch (error) {
          if (error instanceof Error && (error.message.startsWith("Element couldn't be found after ") || error.message.includes("stale element"))) {
            cardGone = true
            break
          }
          throw error
        }
      }

      expect(observedTone).toEqual(successTone)

      // After the fade the card and the bar are gone again
      await systemTest.waitForNoSelector("[data-testid='flash-notifications-notification-bar']", {useBaseSelector: false})
      await systemTest.waitForNoSelector("[data-testid='flash-notifications-notification']", {useBaseSelector: false})
    })
  })
})
