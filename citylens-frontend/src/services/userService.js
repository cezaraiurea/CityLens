import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/users`;

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
});

export const getProfile = async () => {
    const response = await axios.get(`${API_URL}/me`, getAuthHeader());
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await axios.put(`${API_URL}/me`, data, getAuthHeader());
    return response.data;
}