import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { watchlistService } from '../../services/api';

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistService.getWatchlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch watchlist');
    }
  }
);

export const toggleWatchlist = createAsyncThunk(
  'watchlist/toggleWatchlist',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await watchlistService.toggleWatchlist(movieId);
      return { ...response.data, movieId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to toggle watchlist');
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/removeFromWatchlist',
  async (watchlistId, { rejectWithValue }) => {
    try {
      await watchlistService.removeFromWatchlist(watchlistId);
      return { watchlistId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove from watchlist');
    }
  }
);

// Initial state
const initialState = {
  watchlist: [],
  loading: false,
  error: null
};

// Watchlist slice
const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle watchlist
      .addCase(toggleWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.status === 'removed') {
          // Remove from watchlist
          state.watchlist = state.watchlist.filter(item => 
            item.movie.id !== action.payload.movieId
          );
        } else {
          // Add to watchlist
          if (!state.watchlist.some(item => item.movie.id === action.payload.movie.id)) {
            state.watchlist.push(action.payload);
          }
        }
      })
      .addCase(toggleWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = state.watchlist.filter(
          item => item.id !== action.payload.watchlistId
        );
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = watchlistSlice.actions;
export default watchlistSlice.reducer;
