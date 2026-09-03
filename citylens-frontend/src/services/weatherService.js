import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/weather`; 

export const fetchCurrentWeather = async (lat, lon) => {
    try { 
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${API_URL}/current`, {
            params: { lat, lon }, 
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } 
    catch (error) {
        console.error("Weather Service Error:", error);
        return null;
    }
};