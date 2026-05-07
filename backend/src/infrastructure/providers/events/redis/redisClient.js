import net from "node:net";
import tls from "node:tls";

import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

const encodeCommand = (parts) =>
  `*${parts.length}\r\n${parts
    .map((part) => {
      const value = String(part);
      return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
    })
    .join("")}`;

const parseLine = (buffer, offset) => {
  const end = buffer.indexOf("\r\n", offset);
  if (end === -1) return null;
  return {
    line: buffer.slice(offset, end),
    offset: end + 2,
  };
};

const parseBulkString = (buffer, line) => {
  const size = Number(line.line);
  if (size === -1) return { value: null, offset: line.offset };

  const end = line.offset + size;
  if (buffer.length < end + 2) return null;

  return {
    value: buffer.slice(line.offset, end),
    offset: end + 2,
  };
};

const parseArray = (buffer, line) => {
  const count = Number(line.line);
  if (count === -1) return { value: null, offset: line.offset };

  const values = [];
  let nextOffset = line.offset;

  for (let index = 0; index < count; index += 1) {
    const reply = parseReplyAt(buffer, nextOffset);
    if (!reply) return null;
    values.push(reply.value);
    nextOffset = reply.offset;
  }

  return { value: values, offset: nextOffset };
};

const parseReplyAt = (buffer, offset = 0) => {
  if (offset >= buffer.length) return null;

  const type = buffer[offset];
  const line = parseLine(buffer, offset + 1);
  if (!line) return null;

  if (type === 43) return { value: line.line, offset: line.offset };
  if (type === 45) throw new Error(line.line);
  if (type === 58) return { value: Number(line.line), offset: line.offset };
  if (type === 36) return parseBulkString(buffer, line);
  if (type === 42) return parseArray(buffer, line);

  throw new Error(`Unsupported Redis response type: ${String.fromCodePoint(type)}`);
};

const decodeRedisValue = (value) => {
  if (Buffer.isBuffer(value)) return value.toString("utf8");
  if (Array.isArray(value)) return value.map(decodeRedisValue);
  return value;
};

export const createRedisClient = ({ url, logger }) => {
  assertNonEmptyString(url, "url", "[Redis] REDIS_URL is required when EVENT_BUS_PROVIDER=redis");

  const redisUrl = new URL(url);
  let socket;
  let pending = [];
  let responseBuffer = Buffer.alloc(0);

  const flushReplies = () => {
    while (pending.length > 0) {
      let reply;
      try {
        reply = parseReplyAt(responseBuffer);
      } catch (error) {
        const next = pending.shift();
        next.reject(error);
        continue;
      }

      if (!reply) return;

      responseBuffer = responseBuffer.slice(reply.offset);
      const next = pending.shift();
      next.resolve(decodeRedisValue(reply.value));
    }
  };

  const connect = async () => {
    const port = Number(redisUrl.port || 6379);
    const host = redisUrl.hostname;
    const socketFactory = redisUrl.protocol === "rediss:" ? tls.connect : net.connect;

    socket = socketFactory({ host, port });
    socket.setNoDelay(true);

    socket.on("data", (chunk) => {
      responseBuffer = Buffer.concat([responseBuffer, chunk]);
      flushReplies();
    });

    socket.on("error", (error) => {
      logger?.error({ msg: "Redis client error", error });
      for (const request of pending) request.reject(error);
      pending = [];
    });

    await new Promise((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("error", reject);
    });

    if (redisUrl.password) {
      if (redisUrl.username) {
        await sendCommand(["AUTH", decodeURIComponent(redisUrl.username), redisUrl.password]);
      } else {
        await sendCommand(["AUTH", redisUrl.password]);
      }
    }

    await sendCommand(["PING"]);
    logger?.info({ msg: "Redis connected", host, port });
  };

  const sendCommand = (parts) =>
    new Promise((resolve, reject) => {
      if (!socket || socket.destroyed) {
        reject(new Error("[Redis] Client is not connected"));
        return;
      }

      pending.push({ resolve, reject });
      socket.write(encodeCommand(parts), (error) => {
        if (!error) return;
        const request = pending.pop();
        request?.reject(error);
      });
    });

  const close = async () => {
    if (!socket || socket.destroyed) return;

    try {
      await sendCommand(["QUIT"]);
    } catch {
      // The socket may close before QUIT receives a reply.
    }

    socket.destroy();
    logger?.info({ msg: "Redis disconnected" });
  };

  const ping = async () => sendCommand(["PING"]);
  const xadd = async (...parts) => sendCommand(["XADD", ...parts]);
  const xread = async (...parts) => sendCommand(["XREAD", ...parts]);

  return { connect, close, ping, sendCommand, xadd, xread };
};
