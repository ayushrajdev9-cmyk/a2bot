const prefix = '[a2bot]';
const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

module.exports = {
  info: (...args) => console.log(`${timestamp()} ${prefix} INFO:`, ...args),
  warn: (...args) => console.warn(`${timestamp()} ${prefix} WARN:`, ...args),
  error: (...args) => console.error(`${timestamp()} ${prefix} ERROR:`, ...args),
  debug: (...args) => process.env.NODE_ENV === 'development' && console.log(`${timestamp()} ${prefix} DEBUG:`, ...args),
};
