import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React, {memo, useMemo} from "react"
import {Animated, Pressable, StyleSheet, Text, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import useStyles from "@kaspernj/api-maker/build/use-styles.js"

const styles = StyleSheet.create({
  view: {
    padding: 15,
    borderRadius: 11,
    cursor: "pointer"
  },
  viewSmDown: {
    width: "100%"
  },
  viewMdUp: {
    width: 300,
    maxWidth: "100%"
  },
  viewError: {
    border: "1px solid rgba(161, 34, 32, 0.95)",
    backgroundColor: "rgba(161, 34, 32, 0.87)"
  },
  viewSuccess: {
    border: "1px solid rgba(0, 0, 0, 0.95)",
    backgroundColor: "rgba(0, 0, 0, 0.87)"
  },
  viewAlert: {
    border: "1px solid rgba(204, 51, 0, 0.95)",
    backgroundColor: "rgba(204, 51, 0, 0.87)"
  },
  titleview: {
    marginBottom: 5
  },
  titleText: {
    color: "#fff",
    fontWeight: "bold"
  },
  messageText: {
    color: "#fff"
  }
})

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

    const viewStyles = useStyles(styles, ["view", {
      viewError: type == "error",
      viewSuccess: type == "success",
      viewAlert: type == "alert"
    }])

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
          style={viewStyles}
          testID="flash-notifications-notification"
        >
          <View style={styles.titleview} testID="notification-title">
            <Text style={styles.titleText} testID={`flash-notifications/notification-${count}/title`}>
              {title}
            </Text>
          </View>
          <View testID="notification-message">
            <Text style={styles.messageText} testID={`flash-notifications/notification-${count}/message`}>
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
