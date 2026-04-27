const Redis = require('ioredis');

let client;

async function connectRedis() {
    return new Promise((resolve) => {
        client = new Redis(process.env.REDIS_URL);
        client.on('connect', resolve);
        client.on('error', (err) => {
            console.error('Redis error:', err);
            process.exit(1);
        });
    });
}

function getRedis() {
    return client;
}

module.exports = { 
    connectRedis:connectRedis, 
    getRedis:getRedis 
};
