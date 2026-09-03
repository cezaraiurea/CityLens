import axios from 'axios';
 
const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/locations`;

export const fetchNearbyLocations = async (latitude, longitude, categoryId = null, distance = 1200) => {
  try {
    const token = localStorage.getItem('token');

    const requestBody = {
            latitude: latitude,
            longitude: longitude,
            distance: distance,
            categoryId: categoryId
        };
        const response = await axios.post(`${API_URL}/nearby`, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
         
        return response.data.slice(0, 30);
    } 
    catch (error) {
        console.error("Location Service Error:", error);
        return [];  
    }
};

export const fetchLocationById = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Location fetch error:', error);
        return null;
    }
};

export const fetchPlaceByText = async (query) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/search-text`, {
            params: { query },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Place search error:', error);
        return null;
    }
};
