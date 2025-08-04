import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { movieService, recommendationService } from '../../services/api';

// Async thunks
export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await movieService.getMovies(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch movies');
    }
  }
);

export const fetchMovie = createAsyncThunk(
  'movies/fetchMovie',
  async (id, { rejectWithValue }) => {
    try {
      const response = await movieService.getMovie(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch movie details');
    }
  }
);

export const fetchTrending = createAsyncThunk(
  'movies/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await movieService.getTrending();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch trending movies');
    }
  }
);

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async (query, { rejectWithValue }) => {
    try {
      const response = await movieService.searchMovies(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to search movies');
    }
  }
);

export const filterMoviesByGenre = createAsyncThunk(
  'movies/filterByGenre',
  async (genre, { rejectWithValue }) => {
    try {
      const response = await movieService.filterByGenre(genre);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to filter movies by genre');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'movies/fetchRecommendations',
  async (type, { rejectWithValue }) => {
    try {
      const response = await recommendationService.getRecommendations(type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch recommendations');
    }
  }
);

export const fetchSimilarMovies = createAsyncThunk(
  'movies/fetchSimilarMovies',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await recommendationService.getSimilarMovies(movieId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch similar movies');
    }
  }
);

// Initial state
const initialState = {
  movies: [],
  currentMovie: null,
  trending: [],
  recommendations: [],
  similarMovies: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
};

// Movie slice
const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch movies
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.results || action.payload;
        if (action.payload.count) {
          state.totalPages = Math.ceil(action.payload.count / 20); // Assuming 20 items per page
        }
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch movie
      .addCase(fetchMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch trending
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload.results || action.payload;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search movies
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.results || action.payload;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Filter by genre
      .addCase(filterMoviesByGenre.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterMoviesByGenre.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.results || action.payload;
      })
      .addCase(filterMoviesByGenre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch similar movies
      .addCase(fetchSimilarMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.similarMovies = action.payload;
      })
      .addCase(fetchSimilarMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentMovie, setCurrentPage, clearError } = movieSlice.actions;
export default movieSlice.reducer;
