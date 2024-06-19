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


const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
    console.log("connected", socket.id);
})


server.listen(port, (req, res) => {
    console.log("listening on port ", port);
})

app.get("/", (req, res) => {
    res.send("VideoCall Application");
})


