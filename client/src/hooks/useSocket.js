import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
    const { token } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        socketRef.current = io('http://localhost:3000', {
            auth: { token }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [token]);

    return socketRef.current;
}