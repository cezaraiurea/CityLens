import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/ai`;

export const fetchQuizResults = async (preferences) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/recommendations`, preferences, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    catch (error) {
        console.error('Quiz AI error:', error);
        return null;
    }
};