import {act, render} from "@testing-library/react-native"
import Container from "../src/container/index"
import FlashNotifications from "../src/flash-notifications"
import React from "react"

describe("Flash notifications", () => {
  test("it renders", async () => {
    const screen = render(<Container />)

    await act(async () => {
      FlashNotifications.success("Test message")
    })

    const textLink = screen.getByTestId("flash-notifications/notification-1/message")

    expect(textLink).toHaveTextContent("Test message")
  })
})
