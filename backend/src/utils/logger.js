const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const serializedContext = Object.keys(context).length ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${serializedContext}`;
};

export const logger = {
  info(message, context = {}) {
    console.log(formatMessage("info", message, context));
  },
  warn(message, context = {}) {
    console.warn(formatMessage("warn", message, context));
  },
  error(message, context = {}) {
    console.error(formatMessage("error", message, context));
  },
};
