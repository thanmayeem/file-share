import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000
app.use(express.static(path.resolve("./public")));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Sender joins with a Room ID
    socket.on("sender.join", (data) => {
        console.log("Sender joined with ID:", data.uid);
        socket.join(data.uid);
        socket.emit("init", data.uid); // Notify sender of successful join
    });

    // Receiver joins with the same Room ID
    socket.on("receiver.join", (data) => {
        console.log("Receiver joined with ID:", data.uid);
        socket.join(data.uid);
    });

    // Sender sends file metadata
    socket.on("file-metadata", (data) => {
        console.log("File metadata received:", data);
        socket.to(data.uid).emit("file-metadata", data);
    });

    // Sender sends file chunks
    socket.on("file-chunk", (data) => {
        console.log("File chunk received:", data);
        socket.to(data.uid).emit("file-chunk", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});