import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import RoomList from '../components/RoomList';
import ChatPanel from '../components/ChatPanel';

export default function Rooms() {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const socket = useSocket();

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <RoomList selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
            <div style={{ flex: 1 }}>
                {selectedRoom
                    ? <ChatPanel key={selectedRoom._id} room={selectedRoom} socket={socket} />
                    : null
                }
            </div>
        </div>
    );
}
