from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Movie, Genre, Favorite, Rating, Watchlist


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'name')


class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    is_favorite = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ('id', 'title', 'overview', 'release_date', 'poster_path',
                  'backdrop_path', 'tmdb_id', 'genres', 'genre_ids',
                  'popularity', 'vote_average', 'vote_count', 
                  'is_favorite', 'user_rating', 'average_rating')
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, movie=obj).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = Rating.objects.get(user=request.user, movie=obj)
                return rating.rating
            except Rating.DoesNotExist:
                pass
        return None
    
    def create(self, validated_data):
        genre_ids = validated_data.pop('genre_ids', [])
        movie = Movie.objects.create(**validated_data)
        for genre_id in genre_ids:
            try:
                genre = Genre.objects.get(id=genre_id)
                movie.genres.add(genre)
            except Genre.DoesNotExist:
                pass
        return movie


class FavoriteSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ('id', 'user', 'movie', 'movie_id', 'created_at')
        read_only_fields = ('user',)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RatingSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = Rating
        fields = ('id', 'user', 'movie', 'movie_id', 'rating', 'comment', 'created_at', 'username')
        read_only_fields = ('user',)
        
    def get_username(self, obj):
        return obj.user.username
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WatchlistSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Watchlist
        fields = ('id', 'user', 'movie', 'movie_id', 'added_at')
        read_only_fields = ('user',)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
