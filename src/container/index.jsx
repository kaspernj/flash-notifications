import useEventEmitter from "@kaspernj/api-maker/src/use-event-emitter"
import {digg} from "diggerize"
import events from "../events"
import React, {memo} from "react"
import {StyleSheet, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

import Notification from "./notification"

const styles = StyleSheet.create({
  view: {
    position: "fixed",
    zIndex: 99999,
    top: 20,
    right: 20
  }
})

export default memo(shapeComponent(class FlashNotificationsContainer extends ShapeComponent {
  setup() {
    this.useStates({
      count: 0,
      notifications: []
    })

    useEventEmitter(events, "pushNotification", this.tt.onPushNotification)
  }

  render() {
    return (
      <View
        dataSet={this.rootViewDataSet ||= {class: "flash-notifications-container"}}
        style={styles.view}
      >
        {this.s.notifications.map((notification) =>
          <Notification
            key={`notification-${notification.count}`}
            message={notification.message}
            notification={notification}
            onRemovedClicked={this.tt.onRemovedClicked}
            title={notification.title}
            type={notification.type}
          />
        )}
      </View>
    )
  }

  onPushNotification = (detail) => {
    const count = this.s.count + 1

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
