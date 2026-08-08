import type { Server } from "socket.io";

const chatHandler = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("sendMessage", ({ roomId, message, senderId }) => {
      socket.to(roomId).emit("newMessage", {
        roomId,
        message,
        senderId,
        createdAt: Date.now(),
      });
    });
  });
};

export default chatHandler;