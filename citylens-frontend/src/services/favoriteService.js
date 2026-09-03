import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/favorites`;

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
});

export const addFavorite = async (locationId) => {
    const response = await axios.post(`${API_URL}/${locationId}`, {}, getAuthHeader());
    return response.data;
}

export const removeFavorite = async (locationId) => {
    const response = await axios.delete(`${API_URL}/${locationId}`, getAuthHeader());
    return response.data;
}

export const checkIsFavorite = async (locationId) => {
    const response = await axios.get(`${API_URL}/check/${locationId}`, getAuthHeader());
    return response.data;
}

export const getFavorites = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
}