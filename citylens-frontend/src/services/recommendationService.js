import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/locations`;

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
});

export const fetchRecommendations = async (latitude, longitude, isRaining, localHour) => {
    const requestBody = {
        latitude: latitude,
        longitude: longitude,
        isRaining: isRaining,
        localHour: localHour
    };

    const response = await axios.post(
        `${API_URL}/recommendations`,
        requestBody,
        getAuthHeader()
    );

    return response.data;
}