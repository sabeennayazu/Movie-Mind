import os
import requests
import datetime
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from movies.models import Movie, Genre
from dotenv import load_dotenv

load_dotenv()

class Command(BaseCommand):
    help = 'Seed the database with movies from TMDB API or use sample data'

    def add_arguments(self, parser):
        parser.add_argument('--sample', action='store_true', help='Use sample data instead of TMDB API')
        parser.add_argument('--count', type=int, default=20, help='Number of movies to fetch from API')

    def handle(self, *args, **options):
        use_sample = options.get('sample', False)
        count = options.get('count', 100)
        
        # Create genres first
        self.create_genres()
        
        if use_sample or not os.environ.get('TMDB_API_KEY'):
            self.stdout.write(self.style.WARNING('Using sample movie data...'))
            self.create_sample_movies()
        else:
            self.stdout.write(self.style.SUCCESS('Fetching movies from TMDB API...'))
            self.fetch_from_tmdb(count)
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded the database!'))

    def create_genres(self):
        """Create common movie genres"""
        genres = [
            "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", 
            "Drama", "Family", "Fantasy", "History", "Horror", "Music", 
            "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"
        ]
        
        for genre_name in genres:
            Genre.objects.get_or_create(name=genre_name)
            
        self.stdout.write(f"Created {len(genres)} genres")

    def create_sample_movies(self):
        """Create sample movie data"""
        sample_movies = [
            {
                "title": "Inception",
                "overview": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                "release_date": "2010-07-16",
                "poster_path": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                "genres": ["Action", "Science Fiction", "Adventure"],
                "popularity": 82.5
            },
            {
                "title": "The Shawshank Redemption",
                "overview": "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
                "release_date": "1994-09-23",
                "poster_path": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
                "genres": ["Drama", "Crime"],
                "popularity": 76.3
            },
            {
                "title": "The Godfather",
                "overview": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
                "release_date": "1972-03-14",
                "poster_path": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
                "genres": ["Drama", "Crime"],
                "popularity": 73.8
            },
            {
                "title": "Pulp Fiction",
                "overview": "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
                "release_date": "1994-09-10",
                "poster_path": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
                "genres": ["Thriller", "Crime"],
                "popularity": 75.0
            },
            {
                "title": "The Dark Knight",
                "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
                "release_date": "2008-07-16",
                "poster_path": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
                "genres": ["Drama", "Action", "Crime", "Thriller"],
                "popularity": 80.2
            },
            {
                "title": "Fight Club",
                "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground 'fight clubs' forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
                "release_date": "1999-10-15",
                "poster_path": "https://image.tmdb.org/t/p/w500/8kNruSfhk5IoE4eZOc4UpvDn6tq.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
                "genres": ["Drama"],
                "popularity": 68.4
            },
            {
                "title": "The Matrix",
                "overview": "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
                "release_date": "1999-03-30",
                "poster_path": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
                "genres": ["Action", "Science Fiction"],
                "popularity": 77.1
            },
            {
                "title": "The Lord of the Rings: The Fellowship of the Ring",
                "overview": "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.",
                "release_date": "2001-12-18",
                "poster_path": "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg",
                "genres": ["Adventure", "Fantasy", "Action"],
                "popularity": 84.6
            },
            {
                "title": "Interstellar",
                "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
                "release_date": "2014-11-05",
                "poster_path": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
                "genres": ["Adventure", "Drama", "Science Fiction"],
                "popularity": 81.7
            },
            {
                "title": "Parasite",
                "overview": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
                "release_date": "2019-05-30",
                "poster_path": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                "backdrop_path": "https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg",
                "genres": ["Comedy", "Thriller", "Drama"],
                "popularity": 79.3
            }
        ]
        
        created_count = 0
        for movie_data in sample_movies:
            genres = movie_data.pop('genres', [])
            
            # Convert string date to datetime object
            release_date = datetime.datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date()
            movie_data['release_date'] = release_date
            
            # Add vote average and count
            movie_data['vote_average'] = float(movie_data['popularity']) / 10
            movie_data['vote_count'] = int(movie_data['popularity'] * 10)
            
            # Create the movie
            movie, created = Movie.objects.get_or_create(
                title=movie_data['title'],
                defaults=movie_data
            )
            
            # Add genres
            for genre_name in genres:
                try:
                    genre = Genre.objects.get(name=genre_name)
                    movie.genres.add(genre)
                except Genre.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Genre {genre_name} does not exist"))
            
            if created:
                created_count += 1
                
        self.stdout.write(f"Created {created_count} sample movies")

    def fetch_from_tmdb(self, count):
        """Fetch movies from TMDB API"""
        api_key = os.environ.get('TMDB_API_KEY')
        if not api_key:
            self.stdout.write(self.style.ERROR('TMDB_API_KEY not found in environment variables'))
            return
        
        # Map TMDB genre IDs to our genre names
        tmdb_genre_map = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 
            80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 
            14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 
            9648: "Mystery", 10749: "Romance", 878: "Science Fiction", 
            53: "Thriller", 10752: "War", 37: "Western"
        }
        
        # Fetch popular movies
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US"
        created_count = 0
        page = 1
        
        while created_count < count:
            try:
                response = requests.get(f"{url}&page={page}")
                if response.status_code != 200:
                    self.stdout.write(self.style.ERROR(f'Error fetching from TMDB: {response.status_code}'))
                    break
                
                data = response.json()
                if not data.get('results'):
                    break
                
                for movie_data in data['results']:
                
                    if created_count >= count:
                        break

                    title_lower = movie_data.get('title', '').lower()
                    overview_lower = movie_data.get('overview', '').lower()

    # Skip movie if it contains the word "sex" in title or overview
                    if 'sex' in title_lower or 'sex' in overview_lower:
                        self.stdout.write(self.style.WARNING(f"Skipped movie (contains 'sex'): {movie_data.get('title')}"))
                        continue

    # Skip if already exists
                    if Movie.objects.filter(tmdb_id=movie_data['id']).exists():
                        continue


                    
                    
                    # Prepare movie data
                    movie = Movie(
                        title=movie_data['title'],
                        overview=movie_data['overview'],
                        release_date=datetime.datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date() if movie_data.get('release_date') else datetime.date.today(),
                        poster_path=f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}" if movie_data.get('poster_path') else None,
                        backdrop_path=f"https://image.tmdb.org/t/p/original{movie_data['backdrop_path']}" if movie_data.get('backdrop_path') else None,
                        tmdb_id=movie_data['id'],
                        popularity=movie_data['popularity'],
                        vote_average=movie_data['vote_average'],
                        vote_count=movie_data['vote_count']
                    )
                    movie.save()
                    
                    # Add genres
                    for genre_id in movie_data.get('genre_ids', []):
                        if genre_id in tmdb_genre_map:
                            try:
                                genre = Genre.objects.get(name=tmdb_genre_map[genre_id])
                                movie.genres.add(genre)
                            except Genre.DoesNotExist:
                                pass
                    
                    created_count += 1
                    self.stdout.write(f"Created movie: {movie.title}")
                
                page += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
                break
                
        self.stdout.write(f"Created {created_count} movies from TMDB API")

    def fetch_nepali_movies(self, count):
        """Fetch Nepali movies from TMDB API"""
        api_key = os.environ.get('TMDB_API_KEY')
        if not api_key:
            self.stdout.write(self.style.ERROR('TMDB_API_KEY not found in environment variables'))
            return

        tmdb_genre_map = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
            80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
            14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
            9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
            53: "Thriller", 10752: "War", 37: "Western"
        }

        url = f"https://api.themoviedb.org/3/discover/movie?api_key={api_key}&with_original_language=ne&sort_by=popularity.desc"
        created_count, page = 0, 1

        while created_count < count:
            response = requests.get(f"{url}&page={page}")
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Error fetching from TMDB: {response.status_code}'))
                break

            data = response.json()
            if not data.get('results'):
                break

            for movie_data in data['results']:
                if created_count >= count:
                    break

                title_lower = movie_data.get('title', '').lower()
                overview_lower = movie_data.get('overview', '').lower()
                if 'sex' in title_lower or 'sex' in overview_lower:
                    continue

                if Movie.objects.filter(tmdb_id=movie_data['id']).exists():
                    continue

                movie = Movie(
                    title=movie_data['title'],
                    overview=movie_data['overview'],
                    release_date=datetime.datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date() if movie_data.get('release_date') else datetime.date.today(),
                    poster_path=f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}" if movie_data.get('poster_path') else None,
                    backdrop_path=f"https://image.tmdb.org/t/p/original{movie_data['backdrop_path']}" if movie_data.get('backdrop_path') else None,
                    tmdb_id=movie_data['id'],
                    popularity=movie_data['popularity'],
                    vote_average=movie_data['vote_average'],
                    vote_count=movie_data['vote_count']
                )
                movie.save()

                for genre_id in movie_data.get('genre_ids', []):
                    if genre_id in tmdb_genre_map:
                        try:
                            genre = Genre.objects.get(name=tmdb_genre_map[genre_id])
                            movie.genres.add(genre)
                        except Genre.DoesNotExist:
                            pass

                created_count += 1
                self.stdout.write(f"Created Nepali movie: {movie.title}")

            page += 1

        self.stdout.write(f"Created {created_count} Nepali movies from TMDB API")
