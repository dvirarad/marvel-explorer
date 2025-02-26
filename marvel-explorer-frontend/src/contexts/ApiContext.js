import React, { createContext, useContext } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.debug(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Create the API service object
const ApiService = {
  // Get all movies with pagination
  getMovies: async (page = 0, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;

      const response = await apiClient.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Get movies per actor with pagination
  getMoviesPerActor: async (page = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/moviesPerActor', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies per actor:', error);
      throw error;
    }
  },

  // Get actors with multiple characters with pagination
  getActorsWithMultipleCharacters: async (page = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/actorsWithMultipleCharacters', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching actors with multiple characters:', error);
      throw error;
    }
  },

  // Get characters with multiple actors with pagination
  getCharactersWithMultipleActors: async (page = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/charactersWithMultipleActors', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching characters with multiple actors:', error);
      throw error;
    }
  },

  // Database management methods
  cleanDatabase: async ({ taskId } = {}) => {
    try {
      const response = await apiClient.post('/database/clean', { taskId });
      return response.data;
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  },

  reloadDatabase: async ({ taskId } = {}) => {
    try {
      const response = await apiClient.post('/database/reload', { taskId });
      return response.data;
    } catch (error) {
      console.error('Error reloading database:', error);
      throw error;
    }
  }
};

// Create the context
const ApiContext = createContext(null);

// Create a provider component
export const ApiProvider = ({ children }) => {
  return (
    <ApiContext.Provider value={ApiService}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);

  if (context === null) {
    throw new Error('useApi must be used within an ApiProvider');
  }

  return context;
};

export default ApiService;
