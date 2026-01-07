import configuration from "./configuration.js"

const debugLog = (message, context) => {
  if (!configuration.debug) return

  if (context === undefined) {
    console.log(message)
  } else {
    console.log(message, context)
  }
}

export default debugLog
