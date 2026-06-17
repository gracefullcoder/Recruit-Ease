const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require("cors");
const winston = require("winston");

// ============= COLORED REDIS-STYLE LOGGER USING WINSTON =============
const { combine, timestamp, printf, colorize, json } = winston.format;

// ANSI color codes for custom coloring
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
};

// Custom format for Redis-style logs with colors
const redisLogFormat = printf(({ level, message, timestamp, ...metadata }) => {
    // Color coding based on component
    let componentColor = colors.cyan;
    if (metadata.component === 'REDIS_PUBSUB') componentColor = colors.magenta;
    if (metadata.component === 'ROOM_MANAGER') componentColor = colors.yellow;
    if (metadata.operation === 'ERROR' || metadata.status === 'ERROR') componentColor = colors.red;
    if (metadata.operation === 'SET' || metadata.operation === 'HSET') componentColor = colors.green;
    if (metadata.operation === 'GET') componentColor = colors.blue;
    if (metadata.operation === 'DEL') componentColor = colors.red;
    
    // Format the log entry with colors
    const timestampStr = `${colors.gray}${timestamp}${colors.reset}`;
    const componentStr = `${componentColor}[${metadata.component}]${colors.reset}`;
    const operationStr = `${colors.white}${metadata.operation}${colors.reset}`;
    const keyStr = `${colors.yellow}${metadata.key}${colors.reset}`;
    
    // Colorful header
    let logOutput = `\n${timestampStr} ${componentStr} ${operationStr} ${keyStr}\n`;
    
    // Add status with color
    if (metadata.status) {
        const statusColor = metadata.status === 'SUCCESS' ? colors.green : colors.red;
        logOutput += `${colors.gray}  Status: ${statusColor}${metadata.status}${colors.reset}\n`;
    }
    
    // Format data with colors and indentation
    if (metadata.data && Object.keys(metadata.data).length > 0) {
        logOutput += `${colors.gray}  Data:${colors.reset}\n`;
        Object.entries(metadata.data).forEach(([key, value]) => {
            if (typeof value === 'object') {
                logOutput += `${colors.gray}    ${key}:${colors.reset} ${colors.cyan}${JSON.stringify(value)}${colors.reset}\n`;
            } else {
                logOutput += `${colors.gray}    ${key}:${colors.reset} ${colors.white}${value}${colors.reset}\n`;
            }
        });
    }
    
    // Add message
    logOutput += `${colors.gray}  Message:${colors.reset} ${colors.white}${message}${colors.reset}\n`;
    
    return logOutput;
});

// Create Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })
    ),
    transports: [
        // Console transport with custom colors
        new winston.transports.Console({
            format: redisLogFormat
        }),
        // File transport without colors (clean JSON)
        new winston.transports.File({ 
            filename: 'redis-logs.log',
            format: combine(
                timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
                printf(({ timestamp, level, message, ...metadata }) => {
                    return JSON.stringify({
                        timestamp,
                        level,
                        ...metadata,
                        message
                    }, null, 2);
                })
            )
        })
    ]
});

// Convenience methods for different operations
logger.redis = (operation, key, data, status = 'SUCCESS') => {
    return logger.info({
        component: 'REDIS',
        operation,
        key,
        data,
        status,
        message: `${operation} on ${key}`
    });
};

logger.pubsub = (channel, event, data) => {
    return logger.info({
        component: 'REDIS_PUBSUB',
        operation: 'PUBLISH',
        key: channel,
        data: {
            channel,
            event,
            ...data
        },
        status: 'SUCCESS',
        message: `Published to ${channel}: ${event}`
    });
};

logger.room = (action, roomId, details) => {
    return logger.info({
        component: 'ROOM_MANAGER',
        operation: action,
        key: `room:${roomId}`,
        data: details,
        status: 'SUCCESS',
        message: `${action} for room ${roomId}`
    });
};

// Add error logging
logger.error = (operation, key, error) => {
    return logger.log({
        level: 'error',
        component: 'REDIS',
        operation: 'ERROR',
        key,
        data: { error: error.message || error },
        status: 'ERROR',
        message: `Error on ${key}: ${error.message || error}`
    });
};
// ============================================================

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

// Log server startup
logger.redis('INFO', 'server:status', { status: 'STARTING', port: 8000 });

io.on("connection", (socket) => {
    logger.redis('CONNECTION', `socket:${socket.id}`, { event: 'client_connected' });
    
    socket.on("join room", ({ roomId, emailId, userName }) => {
        logger.room('JOIN_ATTEMPT', roomId, { socketId: socket.id, emailId, userName });
        
        if (rooms[roomId]) {
            // Redis GET operation
            logger.redis('GET', `room:${roomId}`, { 
                exists: true, 
                currentParticipants: rooms[roomId].length,
                participants: rooms[roomId] 
            });
            
            if (rooms[roomId].length == 2) {
                // Room full scenario
                logger.redis('CHECK', `room:${roomId}:capacity`, { 
                    maxCapacity: 2, 
                    current: 2, 
                    status: 'FULL' 
                });
                
                socket.emit("room filled", { success: false, message: "Room is filled, select different room Id" });
                
            } else {
                // Update room state
                rooms[roomId].push(socket.id);
                logger.redis('SADD', `room:${roomId}:participants`, { 
                    added: socket.id, 
                    currentSet: rooms[roomId] 
                });
                
                // Store participant details
                socketToUserMapping.set(socket.id, { emailId, roomId, userName });
                logger.redis('HSET', `participant:${socket.id}`, { 
                    emailId, 
                    roomId, 
                    userName,
                    joinedAt: new Date().toISOString()
                });
                
                const otherUser = rooms[roomId].find(id => id !== socket.id);
                if (otherUser) {
                    const otherUserDetails = socketToUserMapping.get(otherUser);
                    
                    // Pub/Sub notification
                    logger.pubsub(`room:${roomId}`, 'user_joined', {
                        newUser: { socketId: socket.id, emailId, userName },
                        existingUser: { socketId: otherUser, ...otherUserDetails }
                    });
                    
                    socket.emit("other user", { userId: otherUser, emailId: otherUserDetails.emailId, userName: otherUserDetails.userName });
                    socket.to(otherUser).emit("user joined", { userId: socket.id, emailId, userName });
                    
                    logger.room('PAIRED', roomId, { 
                        participant1: otherUser, 
                        participant2: socket.id,
                        status: 'ACTIVE'
                    });
                }
            }
        } else {
            // Create new room
            rooms[roomId] = [socket.id];
            logger.redis('SET', `room:${roomId}`, { 
                participant1: socket.id, 
                participant2: null, 
                status: 'waiting',
                createdAt: new Date().toISOString()
            });
            
            socketToUserMapping.set(socket.id, { emailId, roomId, userName });
            logger.redis('HSET', `participant:${socket.id}`, { 
                emailId, 
                roomId, 
                userName,
                joinedAt: new Date().toISOString(),
                role: 'creator'
            });
            
            logger.room('CREATED', roomId, { 
                creator: socket.id,
                status: 'WAITING'
            });
        }
    });

    socket.on("offer", payload => {
        logger.pubsub(`room:${payload.roomId || 'unknown'}`, 'offer', {
            from: socket.id,
            to: payload.target,
            hasSDP: !!payload.sdp
        });
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        logger.pubsub(`room:${payload.roomId || 'unknown'}`, 'answer', {
            from: socket.id,
            to: payload.target,
            hasSDP: !!payload.sdp
        });
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        logger.pubsub(`room:${incoming.roomId || 'unknown'}`, 'ice-candidate', {
            from: socket.id,
            to: incoming.target
        });
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });

    socket.on("disconnect", () => {
        const userId = socket.id;
        logger.redis('CONNECTION', `socket:${socket.id}`, { event: 'client_disconnected' });

        if (socketToUserMapping.has(userId)) {
            const { roomId, emailId, userName } = socketToUserMapping.get(userId);
            
            // Get participant data before deletion
            logger.redis('HGETALL', `participant:${userId}`, { 
                emailId, 
                roomId, 
                userName
            });
            
            // Remove from room
            rooms[roomId] = rooms[roomId].filter(id => id != userId);
            logger.redis('SREM', `room:${roomId}:participants`, { 
                removed: userId, 
                remainingParticipants: rooms[roomId] 
            });
            
            // Delete participant data
            logger.redis('DEL', `participant:${userId}`, { 
                deleted: true,
                data: { emailId, roomId, userName }
            });
            
            // Notify others
            if (rooms[roomId].length > 0) {
                logger.pubsub(`room:${roomId}`, 'user_left', {
                    leaver: userId,
                    remainingParticipants: rooms[roomId]
                });
                io.to(rooms[roomId]).emit("user leaved");
            } else {
                // Room empty - cleanup
                logger.redis('DEL', `room:${roomId}`, { 
                    reason: 'empty',
                    deletedAt: new Date().toISOString()
                });
                delete rooms[roomId];
                logger.room('CLOSED', roomId, { reason: 'all participants left' });
            }
            
            socketToUserMapping.delete(userId);
        }
    });
});

app.use("/", userRouter);

app.use((err, req, res, next) => {
    logger.error('ERROR', 'app:error', err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).json({ succes: false, message });
});

server.listen(8000, () => {
    logger.redis('INFO', 'server:status', { status: 'RUNNING', port: 8000 });
    console.log('\x1b[32m%s\x1b[0m', '✓ Server is running on port 8000');
});