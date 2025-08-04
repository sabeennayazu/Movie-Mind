import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import Movie, Rating
from django.contrib.auth.models import User

def get_content_based_recommendations(user_id=None, movie_id=None, top_n=10):
    """
    Content-Based Filtering: Recommends movies similar to a user's liked movies or a specific movie
    based on movie metadata (e.g., genre, overview, etc.)
    
    Args:
        user_id (int): User ID to get recommendations for (optional)
        movie_id (int): Movie ID to find similar movies for (optional)
        top_n (int): Number of recommendations to return
    
    Returns:
        list: List of recommended movie objects
    """
    # Get all movies
    movies = list(Movie.objects.all())
    
    if len(movies) < 2:
        return []
    
    # Create a corpus of movie metadata (combining overview and genre names)
    corpus = []
    for movie in movies:
        genre_names = " ".join([genre.name for genre in movie.genres.all()])
        metadata = f"{movie.title} {movie.overview} {genre_names}"
        corpus.append(metadata.lower())
    
    # Use TF-IDF Vectorization
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(corpus)
    
    # Calculate cosine similarity between movies
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    if movie_id:
        # Get recommendations for a specific movie
        try:
            movie_idx = next(i for i, movie in enumerate(movies) if movie.id == movie_id)
            sim_scores = list(enumerate(cosine_sim[movie_idx]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            sim_scores = sim_scores[1:top_n+1]  # Exclude the movie itself
            movie_indices = [i[0] for i in sim_scores]
            return [movies[i] for i in movie_indices]
        except (StopIteration, IndexError):
            return []
    
    elif user_id:
        # Get recommendations based on user's favorite or highly-rated movies
        try:
            user = User.objects.get(id=user_id)
            # Get user's favorites and highly rated movies
            favorite_movie_ids = user.favorites.values_list('movie_id', flat=True)
            highly_rated = Rating.objects.filter(user=user, rating__gte=7).values_list('movie_id', flat=True)
            
            movie_ids = list(favorite_movie_ids) + list(highly_rated)
            if not movie_ids:
                # If user has no favorites or ratings, return popular movies
                return Movie.objects.order_by('-popularity')[:top_n]
            
            # Calculate mean similarity with the user's liked movies
            sim_scores = np.zeros(len(movies))
            for movie_id in movie_ids:
                try:
                    movie_idx = next(i for i, movie in enumerate(movies) if movie.id == movie_id)
                    sim_scores += cosine_sim[movie_idx]
                except (StopIteration, IndexError):
                    continue
            
            sim_scores = list(enumerate(sim_scores))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            
            # Filter out movies that user has already interacted with
            sim_scores = [score for score in sim_scores if movies[score[0]].id not in movie_ids]
            sim_scores = sim_scores[:top_n]
            movie_indices = [i[0] for i in sim_scores]
            return [movies[i] for i in movie_indices]
        except User.DoesNotExist:
            return []
    
    # If no user_id or movie_id is provided, return popular movies
    return Movie.objects.order_by('-popularity')[:top_n]


def get_collaborative_filtering_recommendations(user_id, top_n=10):
    """
    Collaborative Filtering: Recommends movies based on user-item interactions
    using a simplified matrix factorization approach.
    
    Args:
        user_id (int): User ID to get recommendations for
        top_n (int): Number of recommendations to return
    
    Returns:
        list: List of recommended movie objects
    """
    # Get all users, movies and ratings
    users = User.objects.all()
    movies = Movie.objects.all()
    ratings = Rating.objects.all()
    
    if len(users) < 5 or len(movies) < 5 or len(ratings) < 10:
        # Not enough data for collaborative filtering, fall back to content-based
        return get_content_based_recommendations(user_id=user_id, top_n=top_n)
    
    # Create a user-item matrix
    user_ids = list(users.values_list('id', flat=True))
    movie_ids = list(movies.values_list('id', flat=True))
    
    # Map IDs to indices
    user_idx_map = {user_id: idx for idx, user_id in enumerate(user_ids)}
    movie_idx_map = {movie_id: idx for idx, movie_id in enumerate(movie_ids)}
    
    # Create rating matrix
    rating_matrix = np.zeros((len(users), len(movies)))
    
    for rating in ratings:
        try:
            user_idx = user_idx_map[rating.user_id]
            movie_idx = movie_idx_map[rating.movie_id]
            rating_matrix[user_idx, movie_idx] = rating.rating
        except KeyError:
            continue
    
    # Fill missing values with mean
    user_ratings_mean = np.true_divide(rating_matrix.sum(1), (rating_matrix != 0).sum(1))
    user_ratings_mean = np.nan_to_num(user_ratings_mean)
    
    # Normalize the matrix
    normalized_matrix = rating_matrix.copy()
    for i in range(rating_matrix.shape[0]):
        non_zero_indices = rating_matrix[i, :] != 0
        normalized_matrix[i, non_zero_indices] -= user_ratings_mean[i]
    
    # Compute user similarity
    user_similarity = cosine_similarity(normalized_matrix)
    
    try:
        # Get current user's index
        current_user_idx = user_idx_map[user_id]
    except KeyError:
        # User not found, fall back to content-based filtering
        return get_content_based_recommendations(user_id=user_id, top_n=top_n)
    
    # Get similar users
    similar_users = np.argsort(user_similarity[current_user_idx])[::-1]
    similar_users = similar_users[1:11]  # Top 10 similar users (excluding self)
    
    # Get movies that the user hasn't rated
    user_ratings = rating_matrix[current_user_idx]
    unwatched = np.where(user_ratings == 0)[0]
    
    # Predict ratings
    predictions = []
    for movie_idx in unwatched:
        prediction = 0
        total_weight = 0
        
        for similar_user_idx in similar_users:
            if rating_matrix[similar_user_idx, movie_idx] > 0:
                # Add weighted rating
                weight = user_similarity[current_user_idx, similar_user_idx]
                prediction += weight * normalized_matrix[similar_user_idx, movie_idx]
                total_weight += weight
        
        if total_weight > 0:
            prediction /= total_weight
            prediction += user_ratings_mean[current_user_idx]
            # Store movie index and predicted rating
            predictions.append((movie_idx, prediction))
    
    # Sort by predicted rating
    predictions.sort(key=lambda x: x[1], reverse=True)
    top_predictions = predictions[:top_n]
    
    # Convert indices back to movie objects
    recommended_movies = []
    for movie_idx, _ in top_predictions:
        movie_id = movie_ids[movie_idx]
        try:
            movie = Movie.objects.get(id=movie_id)
            recommended_movies.append(movie)
        except Movie.DoesNotExist:
            continue
    
    # If we couldn't get enough recommendations, fill with content-based ones
    if len(recommended_movies) < top_n:
        content_recommendations = get_content_based_recommendations(user_id=user_id, top_n=top_n)
        # Add only movies not already in the recommendations
        existing_ids = {movie.id for movie in recommended_movies}
        for movie in content_recommendations:
            if movie.id not in existing_ids and len(recommended_movies) < top_n:
                recommended_movies.append(movie)
    
    return recommended_movies
