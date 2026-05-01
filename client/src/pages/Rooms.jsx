import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState('');
    const [error, setError] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/rooms').then(({ data }) => setRooms(data));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await api.post('/rooms', { name: newRoom });
            setRooms((prev) => [data, ...prev]);
            setNewRoom('');
        } catch {
            setError('Error al crear la sala');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div>
            <div>
                <h1>Salas</h1>
                <button onClick={handleLogout}>Cerrar sesión</button>
            </div>

            <form onSubmit={handleCreate}>
                <input
                    type="text"
                    placeholder="Nueva sala..."
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                />
                <button type="submit">Crear</button>
            </form>
            {error && <p>{error}</p>}

            <ul>
                {rooms.map((room) => (
                    <li key={room._id} onClick={() => navigate(`/chat/${room._id}`)}>
                        <strong>{room.name}</strong>
                        {room.description && <span> — {room.description}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
