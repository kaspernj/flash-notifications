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
    const timeout = setTimeout(() => this.dismissNotificationByCount(count), 4000)

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

    this.setState({count, notifications: this.s.notifications.concat([notification])})
  }

  onRemovedClicked = (notification) => this.dismissNotification(notification)

  onNotificationMeasured = (notification, measuredHeight) => {
    if (notification.measuredHeight) return

    notification.measuredHeight = measuredHeight
    notification.height.setValue(measuredHeight)
    this.setState({notifications: [...this.s.notifications]})
  }

  dismissNotificationByCount = (count) => {
    const notification = this.s.notifications.find((item) => item.count == count)
    if (!notification) return
    this.dismissNotification(notification)
  }

  dismissNotification = (notification) => {
    if (notification.removing) return
    notification.removing = true
    if (notification.timeout) clearTimeout(notification.timeout)

    if (!notification.measuredHeight) {
      notification.measuredHeight = 1
      notification.height.setValue(1)
      this.setState({notifications: [...this.s.notifications]})
    }

    Animated.parallel([
      Animated.timing(notification.opacity, {toValue: 0, duration: 200, useNativeDriver: false}),
      Animated.timing(notification.height, {toValue: 0, duration: 200, useNativeDriver: false}),
      Animated.timing(notification.marginBottom, {toValue: 0, duration: 200, useNativeDriver: false})
    ]).start(() => {
      this.setState({
        notifications: this.s.notifications.filter((item) => item.count != notification.count)
      })
    })
  }
}))
