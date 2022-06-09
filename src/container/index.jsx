import "./style"
import {digg, digs} from "diggerize"
import EventListener from "@kaspernj/api-maker/src/event-listener"
import Notification from "./notification"

export default class FlashNotificationsContainer extends BaseComponent {
  count = 2
  state = {
    notifications: []
  }

  render() {
    const {notifications} = digs(this.state, "notifications")

    return (
      <div className="flash-notifications-container">
        <EventListener event="pushNotification" onCalled={this.onPushNotification} target={window} />

        {notifications.map((notification) =>
          <Notification
            className="mb-3"
            key={`notification-${notification.count}`}
            message={notification.message}
            onRemovedClicked={(e) => this.onRemovedClicked(e, notification)}
            title={notification.title}
            type={notification.type}
          />
        )}
      </div>
    )
  }

  onPushNotification = (event) => {
    const count = this.count
    const detail = digg(event, "detail")

    this.count += 1
    setTimeout(() => this.removeNotification(count), 4000)

    const notification = {
      count,
      message: digg(detail, "message"),
      title: digg(detail, "title"),
      type: digg(detail, "type")
    }

    this.setState({notifications: this.state.notifications.concat([notification])})
  }

  onRemovedClicked(e, notification) {
    e.preventDefault()
    this.removeNotification(digg(notification, "count"))
  }

  removeNotification(count) {
    this.setState({
      notifications: this.state.notifications.filter((notification) => notification.count != count)
    })
  }
}
