import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../../services/api';

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch favorites');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.toggleFavorite(movieId);
      return { ...response.data, movieId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to toggle favorite');
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (favoriteId, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(favoriteId);
      return { favoriteId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove favorite');
    }
  }
);

// Initial state
const initialState = {
  favorites: [],
  loading: false,
  error: null
};

// Favorite slice
const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.is_favorite) {
          // Add to favorites
          if (!state.favorites.some(fav => fav.movie.id === action.payload.movie.id)) {
            state.favorites.push(action.payload);
          }
        } else {
          // Remove from favorites
          state.favorites = state.favorites.filter(fav => { 
            // Need to check both possible payload formats
            const targetId = action.payload.movieId || action.payload.movie?.id;
            return fav.movie.id !== targetId;
          });
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove favorite
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(
          fav => fav.id !== action.payload.favoriteId
        );
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = favoriteSlice.actions;
export default favoriteSlice.reducer;
