import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/admin`;

const getAuthHeader = () => ({
    headers: { Authorization : `Bearer ${localStorage.getItem('token')}`}
});

export const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/users`, getAuthHeader());
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/users/${id}`, getAuthHeader());
    return response.data;
}

