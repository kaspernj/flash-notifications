import {Pressable, Text, View} from "react-native"
import {memo} from "react"
import PropTypesExact from "prop-types-exact"

const NotificationsNotification = (props) => {
  const {className, message, onRemovedClicked, title, type} = props

  const style = {
    width: 300,
    maxWidth: "100%",
    marginBottom: 15,
    padding: 15,
    borderRadius: 11,
    cursor: "pointer"
  }

  if (type == "error") {
    style.border = "1px solid rgba(161 34 32 / 95%)"
    style.background = "rgba(161 34 32 / 87%)"
  }

  if (type == "success") {
    style.border = "1px solid rgba(0 0 0 / 95%)"
    style.background = "rgba(0 0 0 / 87%)"
  }


  if (type == "alert") {
    style.border = "1px solid rgba(204 51 0 / 95%)"
    style.background = "rgba(204 51 0 / 87%)"
  }

  return (
    <Pressable onPress={onRemovedClicked}>
      <View dataSet={{class: classNames("flash-notifications-notification", className), type}} style={style}>
        <View dataSet={{class: "notification-title"}} style={{marginBottom: 5}}>
          <Text style={{color: "#fff", fontWeight: "bold"}}>
            {title}
          </Text>
        </View>
        <View dataSet={{class: "notification-message"}}>
          <Text style={{color: "#fff"}}>
            {message}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

NotificationsNotification.propTypes = PropTypesExact({
  className: PropTypes.string,
  message: PropTypes.string.isRequired,
  onRemovedClicked: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
})

export default memo(NotificationsNotification)
