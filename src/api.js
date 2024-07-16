
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/';

export const checkCoat = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${API_URL}check-coat?lat=${latitude}&lon=${longitude}`);
    return response.data;
  } catch (error) {
    console.error('Error checking coat status', error);
    throw error;
  }
};



export const sendFeedback = async (thumbsup) => {
  try {
    const response = await axios.post(`${API_URL}send-feedback`, {
      thumbsup: thumbsup
    });
    console.log(response);
  } catch (error) {
    console.error('Error checking coat status', error);
    throw error;
  }
};
