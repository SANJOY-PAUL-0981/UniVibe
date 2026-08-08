import type { Server } from "socket.io";
import { checkSignalRateLimit } from "./middleware/socketRateLimiter.js";

const signalHandler = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("signal", ({ roomId, signal }) => {
      if (!checkSignalRateLimit(socket)) {
        return;
      }
      socket.to(roomId).emit("signal", { signal });
    });

    socket.on("media_state", ({ roomId, camOn, micOn }) => {
      socket.to(roomId).emit("media_state", { camOn, micOn });
    });
  });
};

export default signalHandler;
