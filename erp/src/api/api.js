import axios from 'axios';
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Brand API
export const brandAPI = {
    getAll: () => api.get('/brands'),
    getById: (id) => api.get(`/brands/${id}`),
    create: (data) => api.post('/brands', data),
    update: (id, data) => api.put(`/brands/${id}`, data),
    delete: (id) => api.delete(`/brands/${id}`),
    search: (params) => api.get('/brands/search', { params }),
    toggleStatus: (id) => api.post(`/brands/${id}/toggle-status`)
};

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    search: (params) => api.get('/categories/search', { params })
};

// Product API
export const productAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    search: (params) => api.get('/products/search', { params }),
    getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
    getByBrand: (brandId) => api.get(`/products/brand/${brandId}`)
};

// Customer API
export const customerAPI = {
    getAll: () => api.get('/customers'),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
    search: (params) => api.get('/customers/search', { params })
};

// Branch API
export const branchAPI = {
    getAll: () => api.get('/branches'),
    getById: (id) => api.get(`/branches/${id}`),
    create: (data) => api.post('/branches', data),
    update: (id, data) => api.put(`/branches/${id}`, data),
    delete: (id) => api.delete(`/branches/${id}`),
    search: (params) => api.get('/branches/search', { params })
};

// Department API
export const departmentAPI = {
    getAll: () => api.get('/departments'),
    getById: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`),
    search: (params) => api.get('/departments/search', { params })
};

// User/Employee API
export const userAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    search: (params) => api.get('/users/search', { params })
};

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/login', credentials),
    register: (data) => api.post('/register', data),
    logout: () => api.post('/logout'),
    me: () => api.get('/me'),
    refreshToken: () => api.post('/refresh')
};

// Purchase/GRN API
export const purchaseAPI = {
    getAll: () => api.get('/purchases'),
    getById: (id) => api.get(`/purchases/${id}`),
    create: (data) => api.post('/purchases', data),
    update: (id, data) => api.put(`/purchases/${id}`, data),
    delete: (id) => api.delete(`/purchases/${id}`),
    search: (params) => api.get('/purchases/search', { params }),
    getProductHistory: (productId) => api.get(`/purchases/product/${productId}`)
};

// Dashboard
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getSalesData: (params) => api.get('/dashboard/sales', { params }),
    getTopProducts: () => api.get('/dashboard/top-products'),
    getRecentOrders: () => api.get('/dashboard/recent-orders')
};

// Bank API
export const bankAPI = {
    getAll: () => api.get('/banks'),
    getById: (id) => api.get(`/banks/${id}`),
    create: (data) => api.post('/banks', data),
    update: (id, data) => api.put(`/banks/${id}`, data),
    delete: (id) => api.delete(`/banks/${id}`)
};

export default api;