/**
 * Console Logger Adapter — Development.
 *
 * Implements the Logger port interface using console.
 * Replace with PinoLogger in production for structured JSON output.
 *
 * To switch loggers: change resolveLogger.js — no module code changes needed.
 */

const defaultTimestampFormat = "YYYY-MM-DD HH:mm:ss.SSS";

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return !["false", "0", "no", "off"].includes(String(value).toLowerCase());
};

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

const levelStyles = {
  INFO: colors.green,
  WARN: colors.yellow,
  ERROR: colors.red,
  DEBUG: colors.magenta,
};

const colorize = (value, color, shouldColorize = true) =>
  shouldColorize ? `${color}${value}${colors.reset}` : value;

const pad = (value, size = 2) => String(value).padStart(size, "0");

const formatTimestamp = (date, format) => {
  if (format === "iso") return date.toISOString();
  if (format === "locale") return date.toLocaleString();
  if (format === "time") {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  if (format === "unix") return String(Math.floor(date.getTime() / 1000));
  if (format === "unix-ms") return String(date.getTime());

  const tokens = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SSS: pad(date.getMilliseconds(), 3),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, (token) => tokens[token]);
};

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ serializationError: "Unable to serialize log context" });
  }
};

const formatCtx = (ctx, shouldColorize) =>
  ctx && Object.keys(ctx).length
    ? ` ${colorize(safeStringify(ctx), colors.gray, shouldColorize)}`
    : "";

const normalizeLogArgs = (entry, ctx = {}) => {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const { msg, message, ...entryCtx } = entry;
    return {
      msg: msg ?? message ?? "",
      ctx: { ...entryCtx, ...ctx },
    };
  }

  return { msg: entry, ctx };
};

const logToConsole = (level, consoleMethod, scope, options, entry, ctx) => {
  const normalized = normalizeLogArgs(entry, ctx);
  const timestamp = colorize(
    formatTimestamp(new Date(), options.timestampFormat),
    colors.dim,
    options.colorize
  );
  const timeBadge = options.timestampEnabled ? `${timestamp} ` : "";
  const levelBadge = colorize(level.padEnd(5), `${levelStyles[level]}${colors.bold}`, options.colorize);
  const scopedLabel = colorize(`[${scope}]`, colors.cyan, options.colorize);

  consoleMethod(
    `${timeBadge}${levelBadge} ${scopedLabel} ${normalized.msg}${formatCtx(normalized.ctx, options.colorize)}`
  );
};

const createScopedMethods = (scope, options) => ({
  info: (entry, ctx) =>
    logToConsole("INFO", console.info, scope, options, entry, ctx),
  warn: (entry, ctx) =>
    logToConsole("WARN", console.warn, scope, options, entry, ctx),
  error: (entry, ctx) =>
    logToConsole("ERROR", console.error, scope, options, entry, ctx),
  debug: (msg, ctx) =>
    process.env.NODE_ENV !== "production" &&
    logToConsole("DEBUG", console.debug, scope, options, msg, ctx),
});

export const createConsoleLogger = (scope = "app", options = {}) => {
  const loggerOptions = {
    timestampEnabled: options.timestampEnabled,
    timestampFormat: options.timestampFormat ?? defaultTimestampFormat,
    colorize: options.colorize ?? true,
  };
  const methods = createScopedMethods(scope, loggerOptions);
  return {
    ...methods,
    child: (meta = {}) => {
      const childScope = meta.scope
        ? `${scope}:${meta.scope}`
        : scope;
      return createConsoleLogger(childScope, loggerOptions);
    },
  };
};
