import {digg} from "diggerize"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React, {memo, useEffect, useMemo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import useBreakpoint from "@kaspernj/api-maker/build/use-breakpoint"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter"
import useEnvSense from "env-sense/src/use-env-sense.js"
import {View} from "react-native"

import events from "../events"
import Notification from "./notification"

export default memo(shapeComponent(class FlashNotificationsContainer extends ShapeComponent {
  static propTypes = propTypesExact({
    insets: PropTypes.object
  })

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
    const insets = this.props.insets || {}
    const {smDown, mdUp} = useBreakpoint()
    const {isNative} = useEnvSense()

    const viewStyle = useMemo(() => {
      let top = 20
      let right = 0
      let left = undefined

      if (insets.top) top += insets.top
      if (insets.right) right += insets.right

      if (smDown) {
        left = 20

        if (insets.left) left += insets.left

        right += 20
      } else if (mdUp) {
        right += 20
      }

      const style = {
        position: isNative ? "absolute" : "fixed",
        top,
        right,
        left,
        zIndex: 99999
      }

      return style
    }, [isNative, smDown, mdUp, insets.top, insets.right, insets.left])

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
