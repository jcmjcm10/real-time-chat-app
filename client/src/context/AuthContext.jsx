import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
    };

    const register = async (username, password, email) => {
        const { data } = await api.post('/auth/register', { username, password, email });
        localStorage.setItem('token', data.token);
        setToken(data.token);
    };

    const logout = async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        setToken(null);
    };

    const userId = token ? jwtDecode(token).userId : null;

    return (
        <AuthContext.Provider value={{ token, userId, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);