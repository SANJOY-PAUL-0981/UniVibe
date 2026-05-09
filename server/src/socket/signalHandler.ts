import type { Server } from "socket.io";

const signalHandler = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("signal", ({ roomId, signal }) => {
      socket.to(roomId).emit("signal", { signal });
    });

    socket.on("media_state", ({ roomId, camOn, micOn }) => {
      socket.to(roomId).emit("media_state", { camOn, micOn });
    });
  });
};

export default signalHandler;
