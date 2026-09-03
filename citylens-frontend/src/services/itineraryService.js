import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/itinerary`;

export const generateItinerary = async (latitude, longitude, hours, travelerType, startHour, startMinute, radius, options ={}) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/generate`,
            {
                latitude, longitude, hours, travelerType, startHour, startMinute, radius,
                startCategory: options.startCategory || null,
                excludeNames: options.excludeNames || [],
                dayOfWeek: options.dayOfWeek ?? null,
                startLocationName: options.startLocationName || null
            },
            {headers: {Authorization: `Bearer ${token}`}}
        );

        return response.data;

    }
    catch (error) {
        console.error('Itinerary error', error);
        return null;
    }
};