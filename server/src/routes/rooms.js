const router = require('express').Router();
const Room = require('../models/Room');
const Message = require('../models/Message');

router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find({});

        return res.status(200).json(rooms);

    } catch(error) {
        return res.status(500).json({ error });
    }

});

router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        if(!name) return res.status(400).json({ message: "El campo nombre es requerido"});

        const room = await Room.create({ name, description, createdBy:req.user });

        return res.status(201).json(room);

    } catch(error) {
        return res.status(500).json({ error })
    }
});

router.get('/:id/messages', async (req, res) => {
    try {
        const roomId = req.params.id;
        const cursor = req.query.before;
        let messages;
        if (!cursor)
            messages = await Message.find({ room: roomId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('author', 'username');
        else {
            messages = await Message.find({ 
                room: roomId,
                _id: {$lt: cursor}
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('author', 'username');
        }
        
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error })
    }
});


module.exports = router