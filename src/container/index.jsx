// @ts-check

import {digg} from "diggerize"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React, {memo, useEffect, useMemo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import useBreakpoint from "@kaspernj/api-maker/build/use-breakpoint.js"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter.js"
import useEnvSense from "env-sense/build/use-env-sense.js"
import {Animated, View} from "react-native"

import debugLog from "../debug.js"
import events from "../events.js"
import Notification from "./notification"

/**
 * @typedef {object} NotificationObjectType
 * @property {number} count
 * @property {string} message
 * @property {string} title
 * @property {string} type
 */

export default memo(shapeComponent(class FlashNotificationsContainer extends ShapeComponent {
  static propTypes = propTypesExact({
    insets: PropTypes.object
  })

  /** @type {number[]} */
  timeouts = []
  notificationSpacing = 15

  setup() {
    this.useStates({
      count: 0,
      notifications: []
    })

    useEventEmitter(events, "pushNotification", this.onPushNotification)
    useEffect(() => {
      return () => {
        for (const timeout of this.timeouts) {
          clearTimeout(timeout)
        }
      }
    }, [])
  }

  render() {
    const {notifications} = this.s
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
        // @ts-expect-error
        dataSet={this.rootViewDataSet ||= {component: "flash-notifications-container"}}
        // @ts-expect-error
        style={viewStyle}
        testID="flash-notificaitons/container"
      >
        {notifications.map((notification) =>
          <Notification
            count={notification.count}
            key={`notification-${notification.count}`}
            message={notification.message}
            notification={notification}
            onMeasured={this.onNotificationMeasured}
            onRemovedClicked={this.onRemovedClicked}
            title={notification.title}
            type={notification.type}
          />
        )}
      </View>
    )
  }

  /**
   * @param {NotificationObjectType} detail
   * @returns {void}
   */
  onPushNotification = (detail) => {
    const count = this.s.count + 1
    const timeout = setTimeout(() => {
      debugLog("FlashNotifications: notification timeout", {id: count})
      this.dismissNotificationByCount(count, "timeout")
    }, 4000)

    this.timeouts.push(timeout)

    const notification = {
      count,
      height: new Animated.Value(0),
      marginBottom: new Animated.Value(this.notificationSpacing),
      measuredHeight: undefined,
      message: digg(detail, "message"),
      opacity: new Animated.Value(1),
      removing: false,
      timeout,
      title: digg(detail, "title"),
      type: digg(detail, "type")
    }

    debugLog("FlashNotifications: notification added", {
      id: count,
      title: notification.title,
      type: notification.type
    })

    this.setState({count, notifications: this.s.notifications.concat([notification])})
  }

  onRemovedClicked = (notification) => {
    debugLog("FlashNotifications: notification pressed", {id: notification.count})
    this.dismissNotification(notification, "press")
  }

  onNotificationMeasured = (notification, measuredHeight) => {
    if (notification.measuredHeight) return

    debugLog("FlashNotifications: notification measured", {id: notification.count, height: measuredHeight})

    notification.measuredHeight = measuredHeight
    notification.height.setValue(measuredHeight)
    this.setState({notifications: [...this.s.notifications]})
  }

  dismissNotificationByCount = (count, reason = "unknown") => {
    const notification = this.s.notifications.find((item) => item.count == count)
    if (!notification) {
      debugLog("FlashNotifications: notification not found", {id: count, reason})
      return
    }

    this.dismissNotification(notification, reason)
  }

  dismissNotification = (notification, reason = "unknown") => {
    if (notification.removing) {
      debugLog("FlashNotifications: notification already removing", {id: notification.count, reason})
      return
    }

    notification.removing = true
    if (notification.timeout) clearTimeout(notification.timeout)

    if (!notification.measuredHeight) {
      debugLog("FlashNotifications: notification missing measured height", {id: notification.count})
      notification.measuredHeight = 1
      notification.height.setValue(1)
      this.setState({notifications: [...this.s.notifications]})
    }

    debugLog("FlashNotifications: animations begin", {
      id: notification.count,
      animations: ["opacity", "height", "marginBottom"],
      reason
    })
    debugLog("FlashNotifications: fade animation begin", {id: notification.count, reason})

    Animated.parallel([
      Animated.timing(notification.opacity, {toValue: 0, duration: 200, useNativeDriver: false}),
      Animated.timing(notification.height, {toValue: 0, duration: 200, useNativeDriver: false}),
      Animated.timing(notification.marginBottom, {toValue: 0, duration: 200, useNativeDriver: false})
    ]).start(() => {
      debugLog("FlashNotifications: animations end", {
        id: notification.count,
        animations: ["opacity", "height", "marginBottom"],
        reason
      })
      debugLog("FlashNotifications: fade animation end", {id: notification.count, reason})

      this.setState({
        notifications: this.s.notifications.filter((item) => item.count != notification.count)
      })

      debugLog("FlashNotifications: notification removed", {id: notification.count, reason})
    })
  }
}))
