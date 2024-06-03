import {memo} from "react"
import {digg} from "diggerize"
import Notification from "./notification"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useEventListener from "@kaspernj/api-maker/src/use-event-listener"
import {View} from "react-native"

export default memo(shapeComponent(class FlashNotificationsContainer extends ShapeComponent {
  setup() {
    this.useStates({
      count: 0,
      notifications: []
    })

    useEventListener(window, "pushNotification", this.onPushNotification)
  }

  render() {
    return (
      <View
        dataSet={{class: "flash-notifications-container"}}
        style={{
          position: "fixed",
          zIndex: 99999,
          top: 20,
          right: 20
        }}
      >
        {this.state.notifications.map((notification) =>
          <Notification
            key={`notification-${notification.count}`}
            message={notification.message}
            onRemovedClicked={(e) => this.onRemovedClicked(e, notification)}
            title={notification.title}
            type={notification.type}
          />
        )}
      </View>
    )
  }

  onPushNotification = (event) => {
    const detail = digg(event, "detail")
    const count = this.state.count + 1

    setTimeout(() => this.removeNotification(count), 4000)

    const notification = {
      count,
      message: digg(detail, "message"),
      title: digg(detail, "title"),
      type: digg(detail, "type")
    }

    this.setState({count, notifications: this.state.notifications.concat([notification])})
  }

  onRemovedClicked = (e, notification) => {
    e.preventDefault()
    removeNotification(digg(notification, "count"))
  }

  removeNotification = (count) => {
    this.setState({
      notifications: this.state.notifications.filter((notification) => notification.count != count)
    })
  }
}))
