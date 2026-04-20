// @ts-check

import PropTypes from "prop-types"
// @ts-expect-error Package ships no .d.ts files.
import PropTypesExact from "prop-types-exact"
import React, {memo, useMemo} from "react"
import {Animated, Pressable, Text, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {useBreakpoint} from "responsive-breakpoints"

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

/**
 * @typedef {object} FlashNotificationsNotificationProps
 * @property {string=} className
 * @property {number} count
 * @property {string} message
 * @property {StoredNotificationType} notification
 * @property {(notification: StoredNotificationType, measuredHeight: number) => void} onMeasured
 * @property {(notification: StoredNotificationType) => void} onRemovedClicked
 * @property {string} title
 * @property {string} type
 */

/** @type {Record<string, object>} */
const dataSets = {}
/** @type {Record<string, object>} */
const pressableStyles = {}
/** @type {Record<string, import("react-native").ViewStyle>} */
const viewStyles = {}
/** @type {Record<string, import("react-native").TextStyle>} */
const textStyles = {}

export default memo(shapeComponent(
  /**
   * @augments {ShapeComponent<FlashNotificationsNotificationProps>}
   */
  class FlashNotificationsNotification extends ShapeComponent {
  static propTypes = PropTypesExact({
    className: PropTypes.string,
    count: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    notification: PropTypes.object.isRequired,
    onMeasured: PropTypes.func.isRequired,
    onRemovedClicked: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })

  render() {
    const {count, message, title, type} = this.p
    const {className} = this.props
    const breakpoint = useBreakpoint()

    const pressableDataSet = useMemo(
      () => ({
        class: className,
        role: "dialog",
        type
      }),
      [className, type]
    )

    return (
      <Animated.View style={this.tt.wrapperStyle}>
        <Pressable
          // @ts-expect-error React Native types do not include the web-only dataSet prop.
          dataSet={pressableDataSet}
          onLayout={this.tt.onLayout}
          onPress={this.tt.onRemovedClicked}
          style={pressableStyles[`pressable-${type}-${breakpoint.smDown}-${breakpoint.mdUp}`] ||= {
            padding: 15,
            borderRadius: 11,
            cursor: "pointer",
            width: (() => {
              if (breakpoint.smDown) {
                return "100%"
              } else if (breakpoint.mdUp) {
                return 300
              }

              return undefined
            })(),
            maxWidth: (() => {
              if (breakpoint.mdUp) {
                return "100%"
              }

              return undefined
            })(),
            border: (() => {
              if (type == "error") {
                return "1px solid rgba(161, 34, 32, 0.95)"
              } else if (type == "success") {
                return "1px solid rgba(0, 0, 0, 0.95)"
              } else if (type == "alert") {
                return "1px solid rgba(204, 51, 0, 0.95)"
              }

              return undefined
            })(),
            backgroundColor: (() => {
              if (type == "error") {
                return "rgba(161, 34, 32, 0.87)"
              } else if (type == "success") {
                return "rgba(0, 0, 0, 0.87)"
              } else if (type == "alert") {
                return "rgba(204, 51, 0, 0.87)"
              }

              return undefined
            })()
          }}
          testID="flash-notifications-notification"
        >
          <View
            style={viewStyles.titleView ||= {marginBottom: 5}}
            testID="notification-title"
          >
            <Text
              style={textStyles.titleText ||= {
                color: "#fff",
                fontWeight: 700
              }}
              testID={`flash-notifications/notification-${count}/title`}
            >
              {title}
            </Text>
          </View>
          <View
            // @ts-expect-error React Native types do not include the web-only dataSet prop.
            dataSet={dataSets[`notificationMessage-${count}`] ||= {count: `${count}`}}
            testID="notification-message"
          >
            <Text
              style={textStyles.messageText ||= {color: "#fff"}}
              testID={`flash-notifications/notification-${count}/message`}
            >
              {message}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    )
  }

  get wrapperStyle() {
    const {notification} = this.p

    return /** @type {import("react-native").Animated.WithAnimatedObject<import("react-native").ViewStyle>} */ ({
      height: notification.measuredHeight ? notification.height : undefined,
      marginBottom: notification.marginBottom,
      opacity: notification.opacity,
      overflow: "hidden"
    })
  }

  onRemovedClicked = () => this.p.onRemovedClicked(this.p.notification)

  /**
   * @param {import("react-native").LayoutChangeEvent} event
   * @returns {void}
   */
  onLayout = (event) => {
    const {notification} = this.p

    if (!notification.measuredHeight) {
      this.p.onMeasured(notification, event.nativeEvent.layout.height)
    }
  }
}))
