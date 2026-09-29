// @ts-check

import {dig, digg} from "diggerize"
import PropTypes from "prop-types"
// @ts-expect-error Package ships no .d.ts files.
import propTypesExact from "prop-types-exact"
import React, {memo, useEffect, useMemo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {useBreakpoint} from "responsive-breakpoints"
import useEventEmitter from "ya-use-event-emitter"
import useEnvSense from "env-sense/build/use-env-sense.js"
import {Animated, View} from "react-native"

import debugLog from "../debug.js"
import events from "../events.js"
import FlashNotification from "./notification"

/**
 * @typedef {object} NotificationObjectType
 * @property {number} count
 * @property {string | undefined} id
 * @property {string} message
 * @property {string} title
 * @property {string} type
 */

/**
 * @typedef {object} StoredNotificationType
 * @property {number} count
 * @property {string | undefined} id
 * @property {import("react-native").Animated.Value} height
 * @property {import("react-native").Animated.Value} marginBottom
 * @property {number | undefined} measuredHeight
 * @property {string} message
 * @property {import("react-native").Animated.Value} opacity
 * @property {number | undefined} progress
 * @property {boolean} removing
 * @property {ReturnType<typeof setTimeout> | undefined} timeout
 * @property {string} title
 * @property {string} type
 */

/**
 * @typedef {object} ActivityNotificationDetailType
 * @property {"update" | "succeed" | "fail" | "done"} action
 * @property {string} id
 * @property {string=} message
 * @property {number=} progress
 */

/**
 * @typedef {object} FlashNotificationsContainerProps
 * @property {{top?: number, right?: number, left?: number}=} insets
 */

/**
 * @typedef {object} FlashNotificationsContainerState
 * @property {number} count
 * @property {StoredNotificationType[]} notifications
 */

export default memo(shapeComponent(
  /**
   * @augments {ShapeComponent<FlashNotificationsContainerProps, FlashNotificationsContainerState>}
   */
  class FlashNotificationsContainer extends ShapeComponent {
  static propTypes = propTypesExact({
    insets: PropTypes.object
  })

  state = {
    count: 0,
    /** @type {StoredNotificationType[]} */
    notifications: []
  }

  /** @type {number[]} */
  timeouts = []
  notificationSpacing = 15

  setup() {
    useEventEmitter(events, "pushNotification", this.onPushNotificationEvent)
    useEventEmitter(events, "activityNotification", this.onActivityNotificationEvent)
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
        // "box-none" so the fixed, high-zIndex container never intercepts pointer events on its own
        // bounds: empty gaps pass through, and a fading notification (whose wrapper is set to
        // pointerEvents "none" while removing) passes through too, while a live notification still
        // receives its own presses. Without this the container itself would swallow clicks/fills
        // aimed at the form beneath it during a notification's fade-out.
        pointerEvents: "box-none",
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
        // @ts-expect-error React Native types do not include the web-only "fixed" position.
        style={viewStyle}
        testID="flash-notificaitons/container"
      >
        {notifications.map(
          /** @param {StoredNotificationType} notification */
          (notification) =>
          <FlashNotification
            count={notification.count}
            key={`notification-${notification.count}`}
            message={notification.message}
            notification={notification}
            onMeasured={this.onNotificationMeasured}
            onRemovedClicked={this.onRemovedClicked}
            progress={notification.progress}
            removing={notification.removing}
            title={notification.title}
            type={notification.type}
          />
        )}
      </View>
    )
  }

  /**
   * @param {...unknown} args
   * @returns {void}
   */
  onPushNotificationEvent = (...args) => {
    this.onPushNotification(/** @type {NotificationObjectType} */ (args[0]))
  }

  /**
   * @param {NotificationObjectType} detail
   * @returns {void}
   */
  onPushNotification = (detail) => {
    const type = digg(detail, "type")

    // An activity notification without an id has no handle to resolve it and
    // would stay on screen forever, so it is dropped.
    if (type == "activity" && detail.id == undefined) {
      debugLog("FlashNotifications: activity notification without id ignored")
      return
    }

    const count = this.s.count + 1
    // Activity notifications stay on screen until their handle resolves them.
    const timeout = type == "activity" ? undefined : setTimeout(() => {
      debugLog("FlashNotifications: notification timeout", {id: count})
      this.dismissNotificationByCount(count, "timeout")
    }, 4000)

    if (timeout) {
      this.timeouts.push(timeout)
    }

    /** @type {StoredNotificationType} */
    const notification = {
      count,
      height: new Animated.Value(0),
      id: dig(detail, "id"),
      marginBottom: new Animated.Value(this.notificationSpacing),
      measuredHeight: undefined,
      message: digg(detail, "message"),
      opacity: new Animated.Value(1),
      progress: undefined,
      removing: false,
      timeout,
      title: digg(detail, "title"),
      type
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
   * @param {...unknown} args
   * @returns {void}
   */
  onActivityNotificationEvent = (...args) => {
    this.onActivityNotification(/** @type {ActivityNotificationDetailType} */ (args[0]))
  }

  /**
   * @param {ActivityNotificationDetailType} detail
   * @returns {void}
   */
  onActivityNotification = (detail) => {
    const notification = /** @type {StoredNotificationType | undefined} */ (this.s.notifications.find(
      /** @param {StoredNotificationType} item */
      (item) => item.id === detail.id
    ))
    if (!notification || notification.removing) {
      debugLog("FlashNotifications: activity notification not found", {id: detail.id, action: detail.action})
      return
    }

    if (detail.action == "update") {
      debugLog("FlashNotifications: activity progress updated", {id: notification.count, progress: detail.progress})
      notification.progress = detail.progress
      this.setState({notifications: [...this.s.notifications]})
      return
    }

    if (detail.action == "succeed" || detail.action == "fail") {
      debugLog("FlashNotifications: activity resolved", {id: notification.count, action: detail.action})
      // Map the action verbs onto the canonical type names so the card
      // renders the existing success/error tones during the dismiss flash.
      notification.type = detail.action == "succeed" ? "success" : "error"
      if (detail.message) {
        notification.message = detail.message
      }
      this.setState({notifications: [...this.s.notifications]})
      this.dismissNotification(notification, detail.action)
      return
    }

    debugLog("FlashNotifications: activity dismissed", {id: notification.count, action: detail.action})
    this.dismissNotification(notification, "done")
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
    }

    // Re-render immediately so the closing notification drops pointer events (pointerEvents="none")
    // the instant it starts fading out. Otherwise the fading overlay keeps intercepting the next
    // click/fill for the whole fade duration even though it is on its way out.
    this.setState({notifications: [...this.s.notifications]})

    debugLog("FlashNotifications: animations begin", {
      id: notification.count,
      animations: ["opacity", "height", "marginBottom"],
      reason
    })
    debugLog("FlashNotifications: fade animation begin", {id: notification.count, reason})

    const dismissDuration = reason === "press" ? 80 : 200

    Animated.parallel([
      Animated.timing(notification.opacity, {toValue: 0, duration: dismissDuration, useNativeDriver: false}),
      Animated.timing(notification.height, {toValue: 0, duration: dismissDuration, useNativeDriver: false}),
      Animated.timing(notification.marginBottom, {toValue: 0, duration: dismissDuration, useNativeDriver: false})
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
