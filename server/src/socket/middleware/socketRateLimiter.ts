import { Socket } from "socket.io";
import { TokenBucket } from "../../lib/rateLimiter.js";

const signalLimiter = new TokenBucket(100, 50 / 1000); // 100 tokens max, refills at 50 tokens per second

const roomLimiter = new TokenBucket(5, 1 / 1000); // 5 tokens max, refills at 1 token per second

export function checkSignalRateLimit(socket: Socket): Boolean {
  const clientId = socket.id;
  const allowed = signalLimiter.isAllowed(clientId);
  if (!allowed) {
    socket.emit("rate-limit", {
      message: "Too many signaling requests",
    });

    return false;
  }
  return true;
}

export function checkRoomRateLimit(socket: Socket): boolean {
  const clientId = socket.id;

  const allowed = roomLimiter.isAllowed(clientId);

  if (!allowed) {
    socket.emit("rate-limit", {
      message: "Too many room requests",
    });

    return false;
  }

  return true;
}
