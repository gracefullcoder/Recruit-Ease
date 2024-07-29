const express = require("express");
const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const port = 3000;

const corsOptions = {
    origin: "*",
    methods: ["GET", "PUSH", "PUT", "PATCH", "DELETE"],
    credentials: true
};

app.use(cors(corsOptions));

const emailToSocketMapping = new Map();

const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
    console.log("connected", socket.id);

    socket.on("join-it", ({ roomId, emailId }) => {
        console.log(`user connected to ${roomId} from email ${emailId}`);
        socket.join(roomId); 
        emailToSocketMapping.set(emailId,socket.id);
        socket.emit("joined-room", { roomId,emailId });
        socket.broadcast.to(roomId).emit("user-joined", { emailId });
        console.log(emailToSocketMapping);
    })

    socket.on("offer-intrest",({offerFrom,offerTo,offer}) => {
        const toUserSocket = emailToSocketMapping.get(offerTo);
        console.log(toUserSocket,"  ----8888---- ", offerFrom);// jisne call lagaya usko batao u got offer from him
        socket.to(toUserSocket).emit("connect-offer",{offerFrom,offer});
    })

    socket.on("offer-accepted",({offerFrom,answer}) => {
        const socketofferFrom = emailToSocketMapping.get(offerFrom);
        console.log("received the answer means offer accepted",answer);
        socket.to(socketofferFrom).emit("join-video-call",{answer});
        
    })
})


server.listen(port, (req, res) => {
    console.log("listening on port ", port);
})

app.get("/", (req, res) => {
    res.send("VideoCall Application");
})


