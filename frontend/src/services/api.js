import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://seatkeeper.onrender.com/api';

const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const reserveSeat = async (email) => {
    const response = await API.post('/reserve', { email });
    return response.data;
};

export const confirmSeat = async (holdId) => {
    const response = await API.post('/confirm', { holdId });
    return response.data;
};

export const getSeatStatus = async () => {
    const response = await API.get('/status');
    return response.data;
};

export const getReservations = async (email) => {
    const response = await API.get('/reservations', {
        params: { email },
    });
    return response.data;
};


export default API;