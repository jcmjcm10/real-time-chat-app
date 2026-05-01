import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';

export default function Chat() {
    const { id: roomId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [usersOnline, setUsersOnline] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        api.get(`/rooms/${roomId}/messages`).then(({ data }) => {
            setMessages(data.reverse());
        });
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_room', roomId);

        socket.on('new_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('users_online', (users) => {
            setUsersOnline(users);
        });

        socket.on('typing', (userId) => {
            setTyping(userId);
            setTimeout(() => setTyping(null), 2000);
        });

        return () => {
            console.log('Desmontando el componente.')
            socket.emit('leave_room', roomId);
            socket.off('new_message');
            socket.off('users_online');
            socket.off('typing');
        };
    }, [socket, roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        socket.emit('send_message', { roomId, content: input });
        setInput('');
    };

    const handleTyping = () => {
        socket.emit('typing', roomId);
    };

    return (
        <div>
            <div>
                <button onClick={() => navigate('/rooms')}>← Volver</button>
                <span>Online: {usersOnline.length}</span>
            </div>

            <div style={{ height: '60vh', overflowY: 'auto' }}>
                {messages.map((msg) => (
                    <div key={msg._id}>
                        <strong>{msg.author?.username}</strong>: {msg.content}
                    </div>
                ))}
                {typing && <p><em>{typing} está escribiendo...</em></p>}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleTyping}
                />
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
}
