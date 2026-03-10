// @ts-check

import {digg} from "diggerize"
import PropTypes from "prop-types"
// @ts-expect-error No published types for this package.
import propTypesExact from "prop-types-exact"
import React, {memo, useEffect, useMemo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {useBreakpoint} from "responsive-breakpoints"
// @ts-expect-error No published types for this package.
import useEventEmitter from "ya-use-event-emitter"
import useEnvSense from "env-sense/build/use-env-sense.js"
import * as ReactNative from "react-native"

import debugLog from "../debug.js"
import events from "../events.js"
import FlashNotification from "./notification"

void FlashNotification

/**
 * @typedef {object} NotificationObjectType
 * @property {number} count
 * @property {string} message
 * @property {string} title
 * @property {string} type
 */

/**
 * @typedef {object} StoredNotificationType
 * @property {number} count
 * @property {import("react-native").Animated.Value} height
 * @property {import("react-native").Animated.Value} marginBottom
 * @property {number | undefined} measuredHeight
 * @property {string} message
 * @property {import("react-native").Animated.Value} opacity
 * @property {boolean} removing
 * @property {ReturnType<typeof setTimeout>} timeout
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
      <ReactNative.View
        // @ts-expect-error
        dataSet={this.rootViewDataSet ||= {component: "flash-notifications-container"}}
        // @ts-expect-error React Native types do not include the web-only "fixed" position.
        style={viewStyle}
        testID="flash-notificaitons/container"
      >
        {/** @type {StoredNotificationType[]} */ (notifications).map((notification) =>
          <FlashNotification
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
      </ReactNative.View>
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

    /** @type {StoredNotificationType} */
    const notification = {
      count,
      height: new ReactNative.Animated.Value(0),
      marginBottom: new ReactNative.Animated.Value(this.notificationSpacing),
      measuredHeight: undefined,
      message: digg(detail, "message"),
      opacity: new ReactNative.Animated.Value(1),
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

  /**
   * @param {StoredNotificationType} notification
   * @returns {void}
   */
  onRemovedClicked = (notification) => {
    debugLog("FlashNotifications: notification pressed", {id: notification.count})
    this.dismissNotification(notification, "press")
  }

  /**
   * @param {StoredNotificationType} notification
   * @param {number} measuredHeight
   * @returns {void}
   */
  onNotificationMeasured = (notification, measuredHeight) => {
    if (notification.measuredHeight) return

    debugLog("FlashNotifications: notification measured", {id: notification.count, height: measuredHeight})

    notification.measuredHeight = measuredHeight
    notification.height.setValue(measuredHeight)
    this.setState({notifications: [...this.s.notifications]})
  }

  /**
   * @param {number} count
   * @param {string} [reason]
   * @returns {void}
  */
  dismissNotificationByCount = (count, reason = "unknown") => {
    const notification = /** @type {StoredNotificationType | undefined} */ (this.s.notifications.find(
      /** @param {StoredNotificationType} item */
      (item) => item.count == count
    ))
    if (!notification) {
      debugLog("FlashNotifications: notification not found", {id: count, reason})
      return
    }

    this.dismissNotification(notification, reason)
  }

  /**
   * @param {StoredNotificationType} notification
   * @param {string} [reason]
   * @returns {void}
   */
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

    const dismissDuration = reason === "press" ? 80 : 200

    ReactNative.Animated.parallel([
      ReactNative.Animated.timing(notification.opacity, {toValue: 0, duration: dismissDuration, useNativeDriver: false}),
      ReactNative.Animated.timing(notification.height, {toValue: 0, duration: dismissDuration, useNativeDriver: false}),
      ReactNative.Animated.timing(notification.marginBottom, {toValue: 0, duration: dismissDuration, useNativeDriver: false})
    ]).start(() => {
      debugLog("FlashNotifications: animations end", {
        id: notification.count,
        animations: ["opacity", "height", "marginBottom"],
        reason
      })
      debugLog("FlashNotifications: fade animation end", {id: notification.count, reason})

      this.setState({
        notifications: this.s.notifications.filter(
          /** @param {StoredNotificationType} item */
          (item) => item.count != notification.count
        )
      })

      debugLog("FlashNotifications: notification removed", {id: notification.count, reason})
    })
  }
}))
