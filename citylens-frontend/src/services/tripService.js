import axios from 'axios';

const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/itineraries`;

export const saveItinerary = async (tripData) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(API_URL, tripData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error('Save itinerary error:', error);
        return false;
    }
};

export const getItineraries = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Get itineraries error:', error);
        return [];
    }
};

export const completeItinerary = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/${id}/complete`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error('Complete itinerary error:', error);
        return false;
    }
};

export const deleteItinerary = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error('Delete itinerary error:', error);
        return false;
    }
};

export const updateJournal = async(id, photoUrls, journalNote) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/${id}/journal`, 
            { photoUrls, journalNote },
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return true;
    }
    catch (error) {
        console.error('Update journal error', error);
        return false;
    }
}

export const getItinerary = async (id) => {
    const all = await getItineraries();
    return all.find((t) => String(t.id) === String(id)) || null;
};