import {memo, useCallback} from "react"
import {digg} from "diggerize"
import Notification from "./notification"
import useEventListener from "@kaspernj/api-maker/src/use-event-listener"
import useShape from "set-state-compare/src/use-shape"
import {View} from "react-native"

const FlashNotificationsContainer = (props) => {
  const s = useShape(props)

  s.useStates({
    count: 0,
    notifications: []
  })

  const onPushNotification = useCallback((event) => {
    const detail = digg(event, "detail")
    const count = s.s.count + 1

    setTimeout(() => removeNotification(count), 4000)

    const notification = {
      count,
      message: digg(detail, "message"),
      title: digg(detail, "title"),
      type: digg(detail, "type")
    }

    s.set({count, notifications: s.s.notifications.concat([notification])})
  }, [])

  const onRemovedClicked = useCallback((e, notification) => {
    e.preventDefault()
    removeNotification(digg(notification, "count"))
  }, [])

  const removeNotification = useCallback((count) => {
    s.set({
      notifications: s.s.notifications.filter((notification) => notification.count != count)
    })
  }, [])

  useEventListener(window, "pushNotification", onPushNotification)

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
      {s.s.notifications.map((notification) =>
        <Notification
          key={`notification-${notification.count}`}
          message={notification.message}
          onRemovedClicked={(e) => onRemovedClicked(e, notification)}
          title={notification.title}
          type={notification.type}
        />
      )}
    </View>
  )
}

export default memo(FlashNotificationsContainer)
