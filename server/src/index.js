// require('dotenv').config();
console.log("INICIANDO PROGRAMA")
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectMongo = require('./config/mongo');
const { connectRedis } = require('./config/redis');

const authRoutes = require('./routes/auth');
const authJWT = require('./middleware/authJWT');
// const roomRoutes = require('./routes/rooms');
// const messageRoutes = require('./routes/messages');

// const registerSocketHandlers = require('./socket');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', authJWT, roomRoutes);
// app.use('/api/rooms', messageRoutes);

// registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;

async function start() {
  await connectMongo();
  await connectRedis();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
