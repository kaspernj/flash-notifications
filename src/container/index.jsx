import React, {memo} from "react"
import {digg} from "diggerize"
import Notification from "./notification"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useEventListener from "@kaspernj/api-maker/src/use-event-listener"
import {View} from "react-native"

export default memo(shapeComponent(class FlashNotificationsContainer extends ShapeComponent {
  setup() {
    this.useStates({
      count: 0,
      notifications: []
    })

    useEventListener(globalThis, "pushNotification", this.tt.onPushNotification)
  }

  render() {
    return (
      <View
        dataSet={{class: "flash-notifications-container"}}
        style={{
          position: "fixed",
          zIndex: 99999,
          top: 20,
          right: 20
        }}
      >
        {this.s.notifications.map((notification) =>
          <Notification
            key={`notification-${notification.count}`}
            message={notification.message}
            notification={notification}
            onRemovedClicked={this.onRemovedClicked}
            title={notification.title}
            type={notification.type}
          />
        )}
      </View>
    )
  }

  onPushNotification = (event) => {
    const detail = digg(event, "detail")
    const count = this.state.count + 1

    setTimeout(() => this.removeNotification(count), 4000)

    const notification = {
      count,
      message: digg(detail, "message"),
      title: digg(detail, "title"),
      type: digg(detail, "type")
    }

    this.setState({count, notifications: this.s.notifications.concat([notification])})
  }

  onRemovedClicked = (notification) => this.removeNotification(digg(notification, "count"))

  removeNotification = (count) => {
    this.setState({
      notifications: this.s.notifications.filter((notification) => notification.count != count)
    })
  }
}))
