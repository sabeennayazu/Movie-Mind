import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { searchMovies } from '../store/slices/movieSlice';
import { fetchFavorites } from '../store/slices/favoriteSlice';
import MovieList from '../components/MovieList';

const Search = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { movies, loading } = useSelector(state => state.movies);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const query = new URLSearchParams(location.search).get('q');
  
  useEffect(() => {
    if (query) {
      dispatch(searchMovies(query));
      
      if (isAuthenticated) {
        dispatch(fetchFavorites());
      }
    }
  }, [dispatch, query, isAuthenticated]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      <MovieList 
        movies={movies} 
        title={movies?.length > 0 ? `Found ${movies.length} movies` : 'No results found'} 
        loading={loading} 
      />
    </div>
  );
};

export default Search;
