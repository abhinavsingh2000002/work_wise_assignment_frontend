import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function LoginForm() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken'); 
        const userId = localStorage.getItem('userId'); 
        if (token && userId) {
            navigate('/seats', { state: { userId, accessToken: token } });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://work-wise-assignment-backend.onrender.com/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('accessToken', data.user.accessToken);
                navigate('/seats', { state: { userId: data.user.id, accessToken: data.user.accessToken } });    
            } else {
                setError(data.message || 'Invalid Email or Password!');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={credentials.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <div className="password-input" style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            className="form-control"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                        <span 
                            onClick={togglePasswordVisibility} 
                            className="eye-icon" 
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </span>
                    </div>
                </div>
                {loading && <div className="loader"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>}
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
            </form>
            <div className="switch-form">
                <div className="switch-text">Don't have an account? <a href="/signup" className="link">Sign Up</a></div>
            </div>
        </div>
    );
}

export default LoginForm;
