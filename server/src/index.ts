import "dotenv/config";
import { Hono } from "hono";
import { Server } from "socket.io";
import { createServer } from "http";

const app = new Hono()

const httpServer = createServer((req, res) => {
    app.fetch(req as any, res as any);
});

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
})

//roomHandler(io)

const PORT = process.env.PORT

httpServer.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})