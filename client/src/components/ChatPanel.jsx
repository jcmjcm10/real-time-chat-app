import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './ChatPanel.module.css';

export default function ChatPanel({ room, socket }) {
    const { userId } = useAuth();
    const [messages, setMessages] = useState([]);
    const [usersOnline, setUsersOnline] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        api.get(`/rooms/${room._id}/messages`).then(({ data }) => {
            setMessages(data.reverse());
        });
    }, [room._id]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_room', room._id);

        socket.on('new_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('users_online', (users) => {
            setUsersOnline(users);
        });

        socket.on('typing', (username) => {
            setTyping(username);
            setTimeout(() => setTyping(null), 2000);
        });

        return () => {
            socket.emit('leave_room', room._id);
            socket.off('new_message');
            socket.off('users_online');
            socket.off('typing');
        };
    }, [socket, room._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        socket.emit('send_message', { roomId: room._id, content: input });
        setInput('');
    };

    const handleTyping = () => {
        socket.emit('typing', room._id);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <strong>{room.name}</strong>
                <span className={styles.online}>{usersOnline.length} online</span>
            </div>

            <div className={styles.messages}>
                {messages.map((msg) => {
                    const isOwn = msg.author?._id === userId;
                    return (
                        <div key={msg._id} className={`${styles.message} ${isOwn ? styles.own : ''}`}>
                            {!isOwn && <strong>{msg.author?.username}: </strong>}
                            <span className={styles.bubble}>{msg.content}</span>
                        </div>
                    );
                })}
                {typing && <p className={styles.typing}><em>{typing} está escribiendo...</em></p>}
                <div ref={bottomRef} />
            </div>

            <form className={styles.form} onSubmit={handleSend}>
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
