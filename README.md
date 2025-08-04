# Movie Recommendation App

A full-stack movie recommendation web application with personalized content-based and collaborative filtering recommendations.

## Features

- User authentication with JWT tokens
- Browse trending and popular movies
- Search movies by title, genre, and release year
- Add movies to favorites
- Rate movies on a scale of 1-10
- Get personalized recommendations using:
  - Content-based filtering (based on movie metadata)
  - Collaborative filtering (based on user ratings)
- Responsive design for mobile and desktop

## Tech Stack

### Backend
- Django 5.2.4
- Django REST Framework
- Simple JWT for authentication
- SQLite database (can be migrated to PostgreSQL)
- Content-based and collaborative filtering algorithms

### Frontend
- React with Vite
- Redux Toolkit for state management
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-agent
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add the following environment variables:
   ```
   SECRET_KEY=your-secret-key
   DEBUG=True
   TMDB_API_KEY=your-tmdb-api-key  # Optional - get from themoviedb.org
   ```

5. Run migrations:
```bash
python manage.py migrate
```

6. Seed the database with movies:
```bash
# With TMDB API key
python manage.py seed_movies

# Using sample data
python manage.py seed_movies --sample
```

7. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

8. Run the development server:
```bash
python manage.py runserver
```

The backend API will be available at http://localhost:8000/api/

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173/

## API Endpoints

### Authentication
- `POST /api/register/`: Register a new user
- `POST /api/token/`: Get JWT access and refresh tokens
- `POST /api/token/refresh/`: Refresh JWT access token

### Movies
- `GET /api/movies/`: List all movies (with optional filtering)
- `GET /api/movies/{id}/`: Get a specific movie
- `POST /api/movies/`: Create a new movie (admin only)
- `PUT /api/movies/{id}/`: Update a movie (admin only)
- `DELETE /api/movies/{id}/`: Delete a movie (admin only)

### Genres
- `GET /api/genres/`: List all genres
- `GET /api/genres/{id}/`: Get a specific genre

### Favorites
- `GET /api/favorites/`: List user's favorite movies
- `POST /api/favorites/`: Add a movie to favorites
- `DELETE /api/favorites/{id}/`: Remove a movie from favorites
- `POST /api/favorites/toggle/`: Toggle favorite status for a movie

### Ratings
- `GET /api/ratings/`: List user's movie ratings
- `POST /api/ratings/`: Rate a movie
- `PUT /api/ratings/{id}/`: Update a movie rating
- `DELETE /api/ratings/{id}/`: Delete a movie rating

### Recommendations
- `GET /api/recommendations/`: Get movie recommendations
  - Query params:
    - `type`: `content-based` or `collaborative` (default)
    - `movie_id`: Get similar movies to this movie

## Development

### Adding More Features

Some ideas for extending the application:
- User watchlist functionality
- User reviews with comments
- Social features (follow users, share recommendations)
- Advanced filtering and sorting options
- Movie trailers and external links
- Admin dashboard for content management

## License

This project is licensed under the MIT License - see the LICENSE file for details.
