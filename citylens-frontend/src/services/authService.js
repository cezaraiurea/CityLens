import axios from 'axios';
 
const currentHost = window.location.hostname;
const API_URL = `http://${currentHost}:9000/api/auth`; 

export const registerUser = async (userData) => {
  try { 
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;  
  } 
  catch (error) {
    console.error("Error during register process:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data; 
  } 
  catch (error) {
    console.error("Error during login process: ", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
  return response.data;
};
