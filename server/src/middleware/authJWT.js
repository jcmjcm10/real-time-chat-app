const { getRedis } = require('../config/redis');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if(!authHeader) return res.status(401).json({ error: "Forbidden" });
        const authoritationSplit = authHeader.split(" ");

        if(authoritationSplit.length != 2 || authoritationSplit[0] != "Bearer") {
            return res.status(401).json({ error: "Forbidden" })
        }

        const token = authoritationSplit[1];
        const redis = getRedis();
        if(await redis.get(token) === "1") return res.status(401).json({ error: "Forbidden" });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload["userId"]
        next()
    } catch(error) {
        return res.status(500).json({ error })
    }
}
