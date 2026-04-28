const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getRedis } = require('../config/redis');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.'})
        }

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) return res.status(409).json({ error: 'Usuario ya existe' });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({ username, email, password: hashed });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        return res.status(201).json({ token });
    } catch (error) {
        return res.status(500).json({ error: error})
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.'})
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        return res.status(200).json({ token });
    } catch(error) {
        return res.status(500).json({ error: error })
    }

});

router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if(!authHeader) return res.status(400).json({ error: "Token requerido" })

        const authoritationSplit = authHeader.split(" ");
        
        if(authoritationSplit.length != 2 || authoritationSplit[0] != "Bearer") {
            return res.status(400).json({ error: "Formato de la petición incorrecto"})
        }

        const token = authoritationSplit[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const redis = getRedis();
        const ttlRestante = payload.exp - Math.floor(Date.now() / 1000);
        redis.set(token, '1', 'EX', ttlRestante)

        return res.status(200).json({ message: "Logout"})

    } catch (error) {
        return res.status(500).json({ errror: error });
    }
});

module.exports = router