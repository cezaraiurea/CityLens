import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/ai`;

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchCityGuide = async (city, country, travelerType) => {
    try {
        const res = await axios.post(`${API_URL}/city-guide`, { city, country, travelerType }, getAuthHeader());
        return res.data.text;
    }
    catch (e) {
        console.error('Guide error:', e);
        return null;
    }
};

export const fetchTip = async (city, context) => {
    try {
        const res = await axios.post(`${API_URL}/tip`, { city, context }, getAuthHeader());
        return res.data.text;
    }
    catch (e) {
        console.error('Tip error:', e);
        return null;
    }
};

export const fetchTopAttractions = async (city, country) => {
    try {
        const res = await axios.post(`${API_URL}/top-attractions`, { city, country }, getAuthHeader());
        return res.data.attractions || [];
    }
    catch (e) {
        console.error('Attractions error:', e);
        return [];
    }
};