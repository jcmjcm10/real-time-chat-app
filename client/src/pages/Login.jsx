import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import styles from './Login.module.css';
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(username, password);
            navigate('/rooms');
        } catch {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div>
            <h1>Real time Chat</h1>

            <div className={styles['login-card']}>            
                <form style={{ width: '100%'}} onSubmit={handleSubmit}>
                    <input 
                        className='input-form'
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <br/>
                    <input
                        className='input-form'
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br/>
                    {error && <p class='error-message'>{error}</p>}
                    <button class='btn-form' type="submit">Login</button>
                </form>
                <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
            </div>
        </div>
    );
}
