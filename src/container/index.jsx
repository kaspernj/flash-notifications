// @ts-check

import {digg} from "diggerize"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React, {memo, useEffect, useMemo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useBreakpoint from "@kaspernj/api-maker/build/use-breakpoint.js"
import useEventEmitter from "@kaspernj/api-maker/build/use-event-emitter.js"
import useEnvSense from "env-sense/src/use-env-sense.js"
import {View} from "react-native"

import events from "../events.js"
import Notification from "./notification.js"

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

  setup() {
    // @ts-expect-error
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
    // @ts-expect-error
    const insets = this.props.insets || {}
    const {smDown, mdUp} = useBreakpoint()
    const {isNative} = useEnvSense()

    const viewStyle = useMemo(() => {
      const style = {
        position: isNative ? "absolute" : "fixed",
        top: 20 + insets.top,
        right: insets.right,
        left: insets.left,
        zIndex: 99999
      }

      if (smDown) {
        style.left += 20
        style.right += 20
      } else if (mdUp) {
        style.right += 20
      }

      return style
    }, [isNative, smDown, mdUp, insets.top, insets.right, insets.bottom, insets.left])

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

  /**
   * @param {NotificationObjectType} detail
   * @returns {void}
   */
  onPushNotification = (detail) => {
    const count = this.s.count + 1
    const timeout = setTimeout(() => this.removeNotification(count), 4000)

    this.timeouts.push(timeout)

    const notification = {
      count,
      message: digg(detail, "message"),
      title: digg(detail, "title"),
      type: digg(detail, "type")
    }

    // @ts-expect-error
    this.setState({count, notifications: this.s.notifications.concat([notification])})
  }

  onRemovedClicked = (notification) => this.removeNotification(digg(notification, "count"))

  removeNotification = (count) => {
    // @ts-expect-error
    this.setState({
      // @ts-expect-error
      notifications: this.s.notifications.filter((notification) => notification.count != count)
    })
  }
}))
