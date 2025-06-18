import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"
import {digg} from "diggerize"
import React, {memo, useEffect, useMemo} from "react"
import {StyleSheet, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import useEnvironment from "@kaspernj/api-maker/build/use-environment.js"
import {useSafeAreaInsets} from "react-native-safe-area-context"
import useStyles from "@kaspernj/api-maker/build/use-styles.js"

import events from "../events"
import Notification from "./notification"

const styles = StyleSheet.create({
  view: {
    zIndex: 99999
  },
  viewSmDown: {
    right: 20,
    left: 20
  },
  viewMdUp: {
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
    const {isNative} = useEnvironment()
    const insets = useSafeAreaInsets()
    const viewStyleFromStyles = useStyles(styles, "view")
    const viewStyle = useMemo(() => [
      viewStyleFromStyles,
      {
        position: isNative ? "absolute" : "fixed",
        top: insets.top + 20
      }
    ], [insets.top])

    return (
      <View
        dataSet={this.rootViewDataSet ||= {component: "flash-notifications-container"}}
        style={viewStyle}
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
