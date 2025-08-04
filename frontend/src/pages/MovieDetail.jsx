import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovie, fetchSimilarMovies, clearCurrentMovie } from '../store/slices/movieSlice';
import { toggleFavorite } from '../store/slices/favoriteSlice';
import { ratingService } from '../services/api';
import MovieList from '../components/MovieList';
import { toast } from 'react-toastify';

const MovieDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentMovie, similarMovies, loading } = useSelector(state => state.movies);
  const { isAuthenticated } = useSelector(state => state.auth);
  const { favorites } = useSelector(state => state.favorites);
  
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Check if movie is in favorites
  const isFavorite = favorites.some(fav => fav.movie?.id === parseInt(id));
  
  useEffect(() => {
    // Reset state when component mounts
    setUserRating(0);
    setRatingSubmitted(false);
    setComment('');
    setComments([]);
    
    // Fetch movie and similar movies
    dispatch(fetchMovie(id));
    dispatch(fetchSimilarMovies(id));
    
    // Fetch comments for this movie
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await ratingService.getMovieRatings(id);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setCommentsLoading(false);
      }
    };
    
    fetchComments();
    
    return () => {
      dispatch(clearCurrentMovie());
    };
  }, [dispatch, id]);
  
  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(toggleFavorite(parseInt(id)));
  };
  
  const handleRatingChange = (newRating) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setUserRating(newRating);
  };
  
  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (userRating === 0) {
      toast.warning('Please select a rating');
      return;
    }
    
    try {
      setRatingLoading(true);
      await ratingService.rateMovie(id, userRating, comment);
      setRatingSubmitted(true);
      toast.success('Rating and comment submitted successfully!');
      
      // Refresh comments list
      const response = await ratingService.getMovieRatings(id);
      setComments(response.data);
      setComment(''); // Clear comment field after submission
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating and comment');
    } finally {
      setRatingLoading(false);
    }
  };
  
  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading || !currentMovie) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Movie Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="relative">
            <img 
              src={currentMovie.poster_path ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` : '/placeholder-poster.jpg'} 
              alt={currentMovie.title}
              className="w-full rounded-lg shadow-lg"
            />
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-2 px-4 py-2 ${isFavorite ? 'text-red-500' : 'text-white'} border ${isFavorite ? 'border-red-500' : 'border-white'} rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition duration-300`}
            >
              <svg width="24" height="24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        </div>
        
        {/* Movie Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{currentMovie.title}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              <span className="rating-star mr-1">★</span>
              <span className="ml-2">{currentMovie.vote_average?.toFixed(1)} ({currentMovie.vote_count} votes)</span>
            </div>
            <span className="text-gray-400">
              {formatReleaseDate(currentMovie.release_date)}
            </span>
          </div>
          
          <p className="text-gray-200 mb-6">{currentMovie.overview}</p>
          
          {/* Genres */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {currentMovie.genres?.map(genre => (
                <span key={genre.id} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* User Rating Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Rate this movie</h3>
            
            {ratingSubmitted ? (
              <div className="text-green-500 mb-2">
                Your rating has been submitted. Thank you!
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`w-8 h-8 text-xl focus:outline-none ${
                        star <= userRating ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="ml-2 text-yellow-400 font-semibold">{userRating}/10</span>
                  )}
                </div>
                
                <div className="mb-4 w-full">
                  <textarea
                    className="w-full px-3 py-2 border rounded-md text-gray-800"
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleSubmitRating}
                  disabled={!userRating || ratingLoading}
                  className={`self-start px-4 py-2 rounded-md ${
                    userRating && !ratingLoading
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-700 cursor-not-allowed'
                  } transition-colors`}
                >
                  {ratingLoading ? 'Submitting...' : 'Submit Rating & Comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="mt-8 mb-6">
        <h2 className="text-2xl font-bold mb-4">User Comments</h2>
        {commentsLoading ? (
          <p className="text-gray-400">Loading comments...</p>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="font-semibold">{comment.user?.username || 'Anonymous'}</span>
                    <span className="ml-3 text-yellow-400 font-semibold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {comment.rating}/10
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(comment.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                {comment.comment && <p className="text-gray-300">{comment.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
      
      {/* Similar Movies */}
      <div className="mt-12">
        <MovieList movies={similarMovies} title="Similar Movies You Might Like" loading={loading} />
      </div>
    </div>
  );
};

export default MovieDetail;
