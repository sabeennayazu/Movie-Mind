import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrending, fetchMovies } from '../store/slices/movieSlice';
import { fetchFavorites } from '../store/slices/favoriteSlice';
import MovieList from '../components/MovieList';

const Home = () => {
  const dispatch = useDispatch();
  const { trending, movies, loading } = useSelector(state => state.movies);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchTrending());
    dispatch(fetchMovies()); // Fetch general movies
    
    // If user is authenticated, fetch their favorites for favorite status
    if (isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <MovieList movies={trending} title="Trending Movies" loading={loading} />
      </section>
      
      <section className="mb-12">
        <MovieList movies={movies} title="Popular Movies" loading={loading} />
      </section>
    </div>
  );
};

export default Home;
