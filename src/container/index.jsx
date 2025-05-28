import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"
import {digg} from "diggerize"
import React, {memo, useEffect} from "react"
import {StyleSheet, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

import events from "../events"
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
  timeouts = []

  setup() {
    this.useStates({
      count: 0,
      notifications: []
    })

    useEventEmitter(events, "pushNotification", this.tt.onPushNotification)
    useEffect(() => {
      return () => {
        for (const timeout of this.tt.timeouts) {
          clearTimeout(timeout)
        }
      }
    }, [])
  }

  render() {
    return (
      <View
        dataSet={this.rootViewDataSet ||= {component: "flash-notifications-container"}}
        style={styles.view}
        testID="flash-notificaitons/container"
      >
        {this.s.notifications.map((notification) =>
          <Notification
            count={notification.count}
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
    const timeout = setTimeout(() => this.removeNotification(count), 4000)

    this.tt.timeouts.push(timeout)

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
