const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require("cors");

const corsOptions = {
    origin: '*',
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
};

const io = socket(server, {
    cors: corsOptions
});
app.use(cors(corsOptions));

const rooms = {};
const socketToEmailMapping = new Map();

io.on("connection", socket => {
    socket.on("join room", ({ roomId, emailId }) => {
        console.log("join room -> ", roomId);
        if (rooms[roomId]) {
            rooms[roomId].push(socket.id);
        } else {
            rooms[roomId] = [socket.id];
        }

        socketToEmailMapping.set(socket.id, emailId);

        const otherUser = rooms[roomId].find(id => id !== socket.id);
        const otherUserMail = socketToEmailMapping.get(otherUser);
        if (otherUser) {
            socket.emit("other user", { userId: otherUser, emailId: otherUserMail });
            socket.to(otherUser).emit("user joined", { userId: socket.id, emailId });
        }
    });

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        console.log(incoming);
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});

server.listen(8000, () => console.log('server is running on port 8000'));
