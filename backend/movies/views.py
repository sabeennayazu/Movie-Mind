from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Movie, Genre, Favorite, Rating, Watchlist
from .serializers import (
    UserSerializer, MovieSerializer, GenreSerializer,
    FavoriteSerializer, RatingSerializer, WatchlistSerializer
)
from .recommendation import get_content_based_recommendations, get_collaborative_filtering_recommendations


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class MovieViewSet(viewsets.ModelViewSet):
    serializer_class = MovieSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Movie.objects.all().prefetch_related('genres')
        
        # Filter by genre
        genre = self.request.query_params.get('genre')
        if genre:
            try:
                genre_obj = Genre.objects.get(name__iexact=genre)
                queryset = queryset.filter(genres=genre_obj)
            except Genre.DoesNotExist:
                pass
        
        # Filter by year
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(release_date__year=year)
        
        # Filter by search term
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(overview__icontains=search)
            )
        
        # Sort by trending (most favorited recently)
        trending = self.request.query_params.get('trending')
        if trending and trending.lower() == 'true':
            queryset = queryset.annotate(fav_count=Count('favorited_by')).order_by('-fav_count', '-popularity')
        else:
            queryset = queryset.order_by('-popularity')
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
        
    @action(detail=True, methods=['get'], url_path='ratings')
    def get_movie_ratings(self, request, pk=None):
        """Get all ratings for a specific movie"""
        movie = self.get_object()
        ratings = Rating.objects.filter(movie=movie).select_related('user')
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('movie').prefetch_related('movie__genres')
    
    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle_favorite(self, request):
        movie_id = request.data.get('movie_id')
        if not movie_id:
            return Response({'error': 'movie_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        movie = get_object_or_404(Movie, id=movie_id)
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            movie=movie,
        )
        
        if not created:
            # If it already existed, remove it
            favorite.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        
        return Response(
            FavoriteSerializer(favorite, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user).select_related('movie')
    
    def create(self, request, *args, **kwargs):
        # Override to handle updating an existing rating
        movie_id = request.data.get('movie_id')
        if not movie_id:
            return Response({'error': 'movie_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if rating already exists
        try:
            rating = Rating.objects.get(user=request.user, movie_id=movie_id)
            serializer = self.get_serializer(rating, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Rating.DoesNotExist:
            # Create new rating
            return super().create(request, *args, **kwargs)


class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user).select_related('movie').prefetch_related('movie__genres')
    
    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle_watchlist(self, request):
        movie_id = request.data.get('movie_id')
        if not movie_id:
            return Response({'error': 'movie_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        movie = get_object_or_404(Movie, id=movie_id)
        watchlist_item, created = Watchlist.objects.get_or_create(
            user=request.user,
            movie=movie,
        )
        
        if not created:
            # If it already existed, remove it
            watchlist_item.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        
        return Response(
            WatchlistSerializer(watchlist_item, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_recommendations(request):
    user_id = request.user.id
    movie_id = request.query_params.get('movie_id')
    recommendation_type = request.query_params.get('type', 'collaborative')
    
    if movie_id:
        # Get similar movies
        movies = get_content_based_recommendations(movie_id=int(movie_id))
    elif recommendation_type == 'collaborative':
        # Get collaborative filtering recommendations
        movies = get_collaborative_filtering_recommendations(user_id=user_id)
    else:
        # Get content-based recommendations
        movies = get_content_based_recommendations(user_id=user_id)
    
    serializer = MovieSerializer(
        movies, 
        many=True, 
        context={'request': request}
    )
    
    return Response(serializer.data)
