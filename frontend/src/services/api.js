import axios from 'axios';

const BACKEND_BASE_URL = process.env.REACT_APP_API_URL;
// const AUTH_URL = 'http://localhost:8080/api/users';

if (!BACKEND_BASE_URL) {
  console.error('REACT_APP_API_URL is not defined!');
  // You might want to throw an error or handle this more gracefully
}

const API = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
      'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((req) => {
  // Check for 'profile' in localStorage (as used in your Dashboard screenshots for token)
  const user = JSON.parse(localStorage.getItem('profile'));
  // If 'profile' contains a token, use it
  if (user && user.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
  } else {
      // Fallback for direct token storage (from your login function's localStorage.setItem('token'))
      const directToken = localStorage.getItem('token');
      if (directToken) {
          req.headers.Authorization = `Bearer ${directToken}`;
      }
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});


export const getExpenses = async (token) => {
  try {
      const response = await API.get('/api/expenses');
      return response; // Return the full axios response to access .data
  } catch (error) {
      console.error('API Error in getExpenses:', error.response ? error.response.data : error.message);
      throw error;
  }
};

export const addExpense = async (expenseData, token) => {
  try {
      const response = await API.post('/api/expenses', expenseData);
      return response;
  } catch (error) {
      console.error('API Error in addExpense:', error.response ? error.response.data : error.message);
      throw error;
  }
};

export const updateExpense = async (id, updatedData, token) => {
  try {
      const response = await API.put(`/api/expenses/${id}`, updatedData);
      return response;
  } catch (error) {
      console.error('API Error in updateExpense:', error.response ? error.response.data : error.message);
      throw error;
  }
};

export const deleteExpense = async (id, token) => {
  try {
      const response = await API.delete(`/api/expenses/${id}`);
      return response;
  } catch (error) {
      console.error('API Error in deleteExpense:', error.response ? error.response.data : error.message);
      throw error;
  }
};

export const getSummary = async (token) => {
  try {
      const response = await API.get('/api/expenses/summary');
      return response; // Return the full axios response to access .data
  } catch (error) {
      console.error('API Error in getSummary:', error.response ? error.response.data : error.message);
      throw error; // Re-throw to be caught by the component
  }
};

export const login = async (userData) => {
  try {
      const response = await API.post(`/api/users/login`, userData);
      // --- THIS IS CRUCIAL ---
      // Ensure your backend response actually contains a 'token' field,
      // and that it's correctly stored in localStorage.
      if (response.data && response.data.token) { // Check if response.data exists and has a token
        localStorage.setItem('profile', JSON.stringify(response.data)); // Store full profile, including token
        localStorage.setItem('token', response.data.token);
        console.log("Token stored in localStorage:", response.data.token); // For debugging
      }
      return response.data; // Return the user data (including token)
  } catch (error) {
      console.error('API Error in login:', error.response ? error.response.data : error.message);
      throw error;
  }
};
  
  export const register = async (userData) => {
    try {
        const response = await API.post(`/api/users/register`, userData);
        return response.data;
    } catch (error) {
        console.error('API Error in register:', error.response ? error.response.data : error.message);
        throw error;
    }
  };
  