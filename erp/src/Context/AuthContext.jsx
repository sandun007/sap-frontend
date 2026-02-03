import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // fetchUser();
            setIsAuthenticated(true);
        }
    }, [token]);

    // const fetchUser = async () => {
    //     try {
    //         const res = await axios.get('/me');
    //         setUser(res.data.user);
    //         setIsAuthenticated(true);
    //     } catch (err) {
    //         logout();
    //     }
    // };

    const login = async (email, password) => {
        try {
            const res = await axios.post('/login', { email, password });

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            // setUser(res.data.user);
            setIsAuthenticated(true);

            axios.defaults.headers.common['Authorization'] =
                `Bearer ${res.data.token}`;

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};