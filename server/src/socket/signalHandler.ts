import type { Server } from "socket.io";

const signalHandler = (io: Server) => {
    io.on('connection', (socket) => {
        socket.on('signal', ({ roomId, signal }) => {
            socket.to(roomId).emit('signal', { signal })
        })
    })
}

export default signalHandler