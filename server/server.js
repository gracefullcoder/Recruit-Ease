const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require("cors");

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const connectDB = require("./config/dbConfig");
connectDB;


const userRouter = require("./routes/userRoutes");

const corsOptions = {
    origin: '*',
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
};

const io = socket(server, {
    cors: corsOptions
});

app.use(express.json());
app.use(cors(corsOptions));

const rooms = {};
const socketToUserMapping = new Map();

io.on("connection", socket => {
    socket.on("join room", ({ roomId, emailId, userName }) => {
        console.log("join room -> ", roomId);
        if (rooms[roomId]) {
            rooms[roomId].push(socket.id);
        } else {
            rooms[roomId] = [socket.id];
        }

        socketToUserMapping.set(socket.id, { emailId, roomId, userName });

        const otherUser = rooms[roomId].find(id => id !== socket.id);
        const otherUserDetails = socketToUserMapping.get(otherUser);
        if (otherUser) {
            socket.emit("other user", { userId: otherUser, emailId: otherUserDetails.emailId, userName: otherUserDetails.userName });
            socket.to(otherUser).emit("user joined", { userId: socket.id, emailId, userName });
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

    socket.on("disconnect", () => {
        const userId = socket.id;
        const { roomId } = socketToUserMapping.get(userId);

        rooms[roomId] = rooms[roomId].filter(id => id != userId);
        io.to(rooms[roomId]).emit("user leaved");
        socketToUserMapping.delete(userId);
    })
});

app.use("/", userRouter);


server.listen(8000, () => console.log('server is running on port 8000'));
