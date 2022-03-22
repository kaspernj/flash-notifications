import "./style"
import PropTypesExact from "prop-types-exact"

export default class NotificationsNotification extends BaseComponent {
  static propTypes = PropTypesExact({
    className: PropTypes.string,
    message: PropTypes.string.isRequired,
    onRemovedClicked: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  })

  render() {
    const {className, message, onRemovedClicked, title, type} = this.props

    return (
      <div className={classNames("flash-notifications-notification", className)} data-type={type} onClick={onRemovedClicked}>
        <div className="mb-1 notification-title">
          <b>{title}</b>
        </div>
        <div className="notification-message">
          {message}
        </div>
      </div>
    )
  }
}
