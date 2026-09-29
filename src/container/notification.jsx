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
 * @typedef {object} FlashNotificationsNotificationProps
 * @property {string=} className
 * @property {number} count
 * @property {string} message
 * @property {StoredNotificationType} notification
 * @property {(notification: StoredNotificationType, measuredHeight: number) => void} onMeasured
 * @property {(notification: StoredNotificationType) => void} onRemovedClicked
 * @property {number=} progress
 * @property {boolean} removing
 * @property {string} title
 * @property {string} type
 */

/** @type {Record<string, object>} */
const dataSets = {}
/** @type {Record<string, import("react-native").ViewStyle>} */
const viewStyles = {}
/** @type {Record<string, import("react-native").TextStyle>} */
const textStyles = {}
/** @type {import("react-native").ViewStyle} */
const barFillStyle = {backgroundColor: "#fff", borderRadius: 2, height: 4, width: "30%"}

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
    progress: PropTypes.number,
    removing: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })

  /** @type {import("react-native").Animated.Value} */
  barSweep = new Animated.Value(0)
  /** @type {import("react-native").Animated.CompositeAnimation | undefined} */
  barSweepAnimation = undefined
  /** @type {number} */
  barTrackWidth = 0

  componentWillUnmount() {
    this.barSweepAnimation?.stop()
  }

  render() {
    const {count, message, progress, title, type} = this.p
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
      <Animated.View
        style={this.tt.wrapperStyle}
      >
        <Pressable
          // @ts-expect-error React Native types do not include the web-only dataSet prop.
          dataSet={pressableDataSet}
          onLayout={this.tt.onLayout}
          onPress={this.tt.onRemovedClicked}
          style={breakpoint.styling({
            base: {
              padding: 15,
              borderRadius: 11,
              cursor: "pointer",
              border: (() => {
                if (type == "error") {
                  return "1px solid rgba(161, 34, 32, 0.95)"
                } else if (type == "success") {
                  return "1px solid rgba(0, 0, 0, 0.95)"
                } else if (type == "alert") {
                  return "1px solid rgba(204, 51, 0, 0.95)"
                } else if (type == "activity") {
                  return "1px solid rgba(30, 41, 59, 0.95)"
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
                } else if (type == "activity") {
                  return "rgba(30, 41, 59, 0.87)"
                }

                return undefined
              })()
            },
            smDown: {
              width: "100%"
            },
            mdUp: {
              width: 300,
              maxWidth: "100%"
            }
          })}
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
          {type == "activity" ? (
            <View
              onLayout={this.tt.onBarLayout}
              style={viewStyles.barTrack ||= {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: 2,
                height: 4,
                marginTop: 10,
                overflow: "hidden"
              }}
              testID="flash-notifications-notification-bar"
            >
              {progress == undefined ? (
                <Animated.View
                  style={{
                    ...barFillStyle,
                    transform: [{translateX: this.barSweep}]
                  }}
                  testID="flash-notifications-notification-bar-fill"
                />
              ) : (
                <View
                  style={{
                    ...barFillStyle,
                    width: `${progress * 100}%`
                  }}
                  testID="flash-notifications-notification-bar-fill"
                />
              )}
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    )
  }

  get wrapperStyle() {
    const {notification, removing} = this.p

    return /** @type {import("react-native").Animated.WithAnimatedObject<import("react-native").ViewStyle>} */ ({
      height: notification.measuredHeight ? notification.height : undefined,
      marginBottom: notification.marginBottom,
      opacity: notification.opacity,
      overflow: "hidden",
      pointerEvents: removing ? "none" : "auto"
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

  /**
   * @param {FlashNotificationsNotificationProps} prevProps
   * @returns {void}
   */
  componentDidUpdate(prevProps) {
    if (prevProps.progress == undefined && this.p.progress != undefined) {
      this.barSweepAnimation?.stop()
      this.barSweepAnimation = undefined
      return
    }

    if (prevProps.progress != undefined && this.p.progress == undefined && this.barTrackWidth) {
      this.startBarSweep()
    }
  }

  /**
   * @returns {void}
   */
  startBarSweep() {
    this.barSweepAnimation?.stop()
    this.barSweep.setValue(-this.barTrackWidth * 0.3)

    const sweep = Animated.loop(
      Animated.timing(this.barSweep, {duration: 1000, toValue: this.barTrackWidth, useNativeDriver: false})
    )
    sweep.start()
    this.barSweepAnimation = sweep
  }

  /**
   * @param {import("react-native").LayoutChangeEvent} event
   * @returns {void}
   */
  onBarLayout = (event) => {
    const trackWidth = event.nativeEvent.layout.width

    if (!trackWidth || this.barTrackWidth == trackWidth) return

    this.barTrackWidth = trackWidth

    if (this.p.progress == undefined) {
      this.startBarSweep()
    }
  }
}

export default memo(shapeComponent(FlashNotificationsNotification))
