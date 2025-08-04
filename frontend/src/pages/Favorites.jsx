import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFavorites } from '../store/slices/favoriteSlice';
import MovieCard from '../components/MovieCard';

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { favorites, loading } = useSelector(state => state.favorites);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="movie-card animate-pulse bg-gray-800">
              <div className="w-full aspect-[2/3] bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map(favorite => (
            <MovieCard key={favorite.id} movie={favorite.movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">You haven't added any movies to your favorites yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Browse Movies
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
