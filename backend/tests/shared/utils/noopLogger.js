export const noopLogger = Object.freeze({
  info() {},
  warn() {},
  error() {},
  debug() {},
  child() {
    return noopLogger;
  },
});
