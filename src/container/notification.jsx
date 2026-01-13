import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React, {memo, useMemo} from "react"
import {Animated, Pressable, Text, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {useBreakpoint} from "responsive-breakpoints"

const dataSets = {}
const styles = {}

export default memo(shapeComponent(class FlashNotificationsNotification extends ShapeComponent {
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
          dataSet={pressableDataSet}
          onLayout={this.tt.onLayout}
          onPress={this.tt.onRemovedClicked}
          style={styles[`pressable-${type}-${breakpoint.smDown}-${breakpoint.mdUp}`] ||= {
            padding: 15,
            borderRadius: 11,
            cursor: "pointer",
            width: (() => {
              if (breakpoint.smDown) {
                return "100%"
              } else if (breakpoint.mdUp) {
                return 300
              }
            })(),
            maxWidth: (() => {
              if (breakpoint.mdUp) {
                return "100%"
              }
            })(),
            border: (() => {
              if (type == "error") {
                return "1px solid rgba(161, 34, 32, 0.95)"
              } else if (type == "success") {
                return "1px solid rgba(0, 0, 0, 0.95)"
              } else if (type == "alert") {
                return "1px solid rgba(204, 51, 0, 0.95)"
              }
            })(),
            backgroundColor: (() => {
              if (type == "error") {
                return "rgba(161, 34, 32, 0.87)"
              } else if (type == "success") {
                return "rgba(0, 0, 0, 0.87)"
              } else if (type == "alert") {
                return "rgba(204, 51, 0, 0.87)"
              }
            })()
          }}
          testID="flash-notifications-notification"
        >
          <View
            style={styles.titleView ||= {marginBottom: 5}}
            testID="notification-title"
          >
            <Text
              style={styles.titleText ||= {
                color: "#fff",
                fontWeight: 700
              }}
              testID={`flash-notifications/notification-${count}/title`}
            >
              {title}
            </Text>
          </View>
          <View
            dataSet={dataSets[`notificationMessage-${count}`] ||= {count: `${count}`}}
            testID="notification-message"
          >
            <Text
              style={styles.messageText ||= {color: "#fff"}}
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

    return {
      height: notification.measuredHeight ? notification.height : undefined,
      marginBottom: notification.marginBottom,
      opacity: notification.opacity,
      overflow: "hidden"
    }
  }

  onRemovedClicked = () => this.p.onRemovedClicked(this.p.notification)

  onLayout = (event) => {
    const {notification} = this.p

    if (!notification.measuredHeight) {
      this.p.onMeasured(notification, event.nativeEvent.layout.height)
    }
  }
}))
