import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function RoomList({ selectedRoom, onSelectRoom }) {
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
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #333' }}>
                <strong>Salas</strong>
                <button onClick={handleLogout}>Salir</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', padding: '8px', borderBottom: '1px solid #333' }}>
                <input
                    type="text"
                    placeholder="Nueva sala..."
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    style={{ flex: 1, marginRight: '4px' }}
                />
                <button type="submit">+</button>
            </form>
            {error && <p style={{ color: 'red', padding: '0 8px', fontSize: '12px' }}>{error}</p>}

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto' }}>
                {rooms.map((room) => (
                    <li
                        key={room._id}
                        onClick={() => onSelectRoom(room)}
                        style={{
                            padding: '12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #222',
                            backgroundColor: selectedRoom?._id === room._id ? '#2a2a2a' : 'transparent'
                        }}
                    >
                        <strong>{room.name}</strong>
                        {room.description && <div style={{ fontSize: '12px', color: '#888' }}>{room.description}</div>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
