import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleFavorite } from '../store/slices/favoriteSlice';
import { toggleWatchlist } from '../store/slices/watchlistSlice';

const MovieCard = ({ movie }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { favorites } = useSelector(state => state.favorites);
  const { watchlist } = useSelector(state => state.watchlist);

  const [isHovered, setIsHovered] = useState(false);

  const isFavorite = favorites.some(fav => fav.movie.id === movie.id) || movie.is_favorite;
  const isInWatchlist = watchlist.some(item => item.movie.id === movie.id) || movie.is_in_watchlist;

  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleFavorite(movie.id));
  };

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWatchlist(movie.id));
  };

  const handleClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="movie-card cursor-pointer text-left w-full block p-0 border-0 bg-transparent"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image */}
      <img
        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg'}
        alt={movie.title}
        className="movie-poster"
      />

      {/* Movie Info Overlay */}
      <div className={`movie-info transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
        <h3 className="font-bold text-lg text-white truncate">{movie.title}</h3>
        <p className="text-sm text-gray-300">{formatReleaseDate(movie.release_date)}</p>

        <div className="flex items-center mt-1">
          <span className="rating-star">★</span>
          <span className="ml-1 text-sm">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>

      {/* Favorite Button */}
      <button
        type="button"
        onClick={handleFavoriteToggle}
        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isFavorite ? 'bg-red-600' : 'bg-gray-800 bg-opacity-70 hover:bg-gray-700'
        }`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 ${isFavorite ? 'text-white' : 'text-gray-300'}`}
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      </button>

      {/* Watchlist Button */}
      <button
        type="button"
        onClick={handleWatchlistToggle}
        className={`absolute top-2 right-12 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isInWatchlist ? 'bg-blue-600' : 'bg-gray-800 bg-opacity-70 hover:bg-gray-700'
        }`}
        aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 ${isInWatchlist ? 'text-white' : 'text-gray-300'}`}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    </div>
  );
};

export default MovieCard;
