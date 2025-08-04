import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../store/slices/movieSlice';
import { fetchFavorites } from '../store/slices/favoriteSlice';
import MovieList from '../components/MovieList';

const Recommendations = () => {
  const dispatch = useDispatch();
  const { recommendations, loading } = useSelector(state => state.movies);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [recommendationType, setRecommendationType] = useState('content-based');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRecommendations(recommendationType));
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated, recommendationType]);

  const handleRecommendationTypeChange = (type) => {
    setRecommendationType(type);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Personalized Recommendations</h2>
        <p className="text-gray-300 mb-8">
          Please sign in to see your personalized movie recommendations based on your ratings and favorites.
        </p>
        <a 
          href="/login" 
          className="btn-primary inline-block"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Your Movie Recommendations</h1>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={() => handleRecommendationTypeChange('content-based')}
            className={`px-4 py-2 rounded-md transition-colors ${
              recommendationType === 'content-based' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Content-Based
          </button>
          <button 
            onClick={() => handleRecommendationTypeChange('collaborative')}
            className={`px-4 py-2 rounded-md transition-colors ${
              recommendationType === 'collaborative' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Collaborative
          </button>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-md mb-6">
          <h3 className="font-semibold mb-2">About this recommendation method:</h3>
          <p className="text-gray-300 text-sm">
            {recommendationType === 'content-based' ? (
              <>
                Content-based recommendations suggest movies similar to ones you've liked before, 
                based on movie attributes like genre, plot, actors, and directors.
              </>
            ) : (
              <>
                Collaborative filtering recommendations are based on patterns found among many users. 
                Movies are suggested because users with similar tastes to you have enjoyed them.
              </>
            )}
          </p>
        </div>
      </div>
      
      <MovieList 
        movies={recommendations} 
        title={`${recommendationType === 'content-based' ? 'Content-Based' : 'Collaborative'} Recommendations`} 
        loading={loading} 
      />
    </div>
  );
};

export default Recommendations;
