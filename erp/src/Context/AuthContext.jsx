import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);


axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );


        return () => axios.interceptors.request.eject(interceptor);
    }, []);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);


    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    const res = await axios.get('/me');

                    setUser(res.data.user);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Auth initialization failed:', err);
                    logout();
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/login', { email, password });

            const newToken = res.data.token;
            const userData = res.data.user;


            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            return { success: true, user: userData };
        } catch (err) {
            console.error('Login error:', err);
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

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};