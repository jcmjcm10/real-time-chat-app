const jwt = require('jsonwebtoken');
const { getRedis } = require('../config/redis');
const Message = require('../models/Message');


module.exports = (io) => {
    io.use( async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Unautorized'));

            const redis = getRedis();
            if(await redis.get(token) === "1") return next(new Error('Unautorized'));

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = payload["userId"]
            next()            
        } catch (error) {
            return next(new Error('Unautorized'));
        }
    });

    io.on('connection', (socket) => {
        const rooms = new Set();

        socket.on('join_room', async (roomId) => {
            socket.join(roomId);
            rooms.add(roomId);

            const redis = getRedis();
            await redis.sadd(`room:${roomId}:online`, socket.user);
            
            const online = await redis.smembers(`room:${roomId}:online`);
            io.to(roomId).emit('users_online', online);
        });

        socket.on('leave_room', async (roomId) => {
            socket.leave(roomId);
            rooms.delete(roomId);

            const redis = getRedis();
            await redis.srem(`room:${roomId}:online`, socket.user);
            
            const online = await redis.smembers(`room:${roomId}:online`);
            io.to(roomId).emit('users_online', online);
        });

        socket.on('send_message', async ({ roomId, content }) => {
            let message = await Message.create({ room: roomId, content: content, author: socket.user});

            message = await message.populate('author', 'username');
            io.to(roomId).emit('new_message', message);
        });

        socket.on('typing', (roomId) => {
            socket.to(roomId).emit('typing', socket.user)
        });

        socket.on('disconnect', async () => {
            const redis = getRedis();
            for (const roomId of rooms) {
                await redis.srem(`room:${roomId}:online`, socket.user);
                const online = await redis.smembers(`room:${roomId}:online`);
                io.to(roomId).emit('users_online', online);
                console.log("online:", online);
            }
        });
    });
};
