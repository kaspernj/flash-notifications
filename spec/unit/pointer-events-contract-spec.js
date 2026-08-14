// @ts-check

import "velocious/build/src/testing/test.js"
import fs from "node:fs/promises"

describe("pointer events component contract", () => {
  it("keeps pointer events in styles instead of deprecated top-level props", async () => {
    const containerSource = await fs.readFile("src/container/index.jsx", "utf8")
    const notificationSource = await fs.readFile("src/container/notification.jsx", "utf8")

    expect(containerSource).toContain('pointerEvents: "box-none"')
    expect(notificationSource).toContain('pointerEvents: removing ? "none" : "auto"')
    expect(containerSource).not.toMatch(/<View[^>]*\spointerEvents=/)
    expect(notificationSource).not.toMatch(/<Animated\.View[^>]*\spointerEvents=/)
  })
})
