import classNames from "classnames"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React, {memo, useMemo} from "react"
import {Pressable, StyleSheet, Text, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

const styles = StyleSheet.create({
  view: {
    width: 300,
    maxWidth: "100%",
    marginBottom: 15,
    padding: 15,
    borderRadius: 11,
    cursor: "pointer"
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

const titleViewDataSet = {class: "notification-title"}
const messageViewDataSet = {class: "notification-message"}

export default memo(shapeComponent(class NotificationsNotification extends ShapeComponent {
  static propTypes = PropTypesExact({
    className: PropTypes.string,
    message: PropTypes.string.isRequired,
    notification: PropTypes.object.isRequired,
    onRemovedClicked: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })

  render() {
    const {className, message, title, type} = this.props

    const viewStyles = useMemo(
      () => {
        const viewStyles = [styles.view]

        if (type == "error") viewStyles.push(styles.viewError)
        if (type == "success") viewStyles.push(styles.viewSuccess)
        if (type == "alert") viewStyles.push(styles.viewAlert)

        return viewStyles
      },
      [type]
    )

    const pressableDataSet = useMemo(
      () => ({
        class: classNames("flash-notifications-notification", className),
        type
      }),
      [className, type]
    )

    return (
      <Pressable dataSet={pressableDataSet} onPress={this.tt.onRemovedClicked}>
        <View style={viewStyles}>
          <View dataSet={titleViewDataSet} style={styles.titleview}>
            <Text style={styles.titleText}>
              {title}
            </Text>
          </View>
          <View dataSet={messageViewDataSet}>
            <Text style={styles.messageText}>
              {message}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  onRemovedClicked = () => this.p.onRemovedClicked(this.p.notification)
}))
