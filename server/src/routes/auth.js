const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: error})
    }
});

module.exports = router