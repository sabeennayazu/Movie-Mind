import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and hasn't been retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, user needs to login again
          localStorage.removeItem('token');
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Store the new access token
        localStorage.setItem('token', response.data.access);
        
        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout the user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  login: (username, password) => 
    api.post('/token/', { username, password }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        return response.data;
      }),
  
  register: (userData) => 
    api.post('/register/', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }),
    
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token ? true : false;
  }
};

// Movie services
const movieService = {
  getMovies: (params = {}) => 
    api.get('/movies/', { params }),
  
  getMovie: (id) => 
    api.get(`/movies/${id}/`),
  
  getTrending: () => 
    api.get('/movies/', { params: { trending: true } }),
  
  searchMovies: (query) => 
    api.get('/movies/', { params: { search: query } }),
    
  filterByGenre: (genre) => 
    api.get('/movies/', { params: { genre } })
};

// Favorites services
const favoriteService = {
  getFavorites: () => 
    api.get('/favorites/'),
  
  toggleFavorite: (movieId) => 
    api.post('/favorites/toggle/', { movie_id: movieId }),
    
  addFavorite: (movieId) => 
    api.post('/favorites/', { movie_id: movieId }),
    
  removeFavorite: (favoriteId) => 
    api.delete(`/favorites/${favoriteId}/`)
};

// Rating services
const ratingService = {
  getRatings: () => 
    api.get('/ratings/'),
  
  getMovieRatings: (movieId) =>
    api.get(`/movies/${movieId}/ratings/`),
  
  rateMovie: (movieId, rating, comment = '') => 
    api.post('/ratings/', { 
      movie_id: movieId, 
      rating, 
      comment 
    }),
};

// Recommendation services
const recommendationService = {
  getRecommendations: (type = 'collaborative') => 
    api.get('/recommendations/', { params: { type } }),
    
  getSimilarMovies: (movieId) => 
    api.get('/recommendations/', { params: { movie_id: movieId } })
};

export {
  api,
  authService,
  movieService,
  favoriteService,
  ratingService,
  recommendationService
};
