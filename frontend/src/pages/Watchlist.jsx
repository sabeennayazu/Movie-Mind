import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWatchlist } from '../store/slices/watchlistSlice';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { watchlist, loading } = useSelector(state => state.watchlist);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(fetchWatchlist());
  }, [dispatch, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Watchlist</h1>
      
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
      ) : watchlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchlist.map(watchlistItem => (
            <MovieCard key={watchlistItem.id} movie={watchlistItem.movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">You haven't added any movies to your watchlist yet.</p>
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

export default Watchlist;
