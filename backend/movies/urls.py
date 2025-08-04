from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'movies', views.MovieViewSet, basename='movie')
router.register(r'genres', views.GenreViewSet, basename='genre')
router.register(r'favorites', views.FavoriteViewSet, basename='favorite')
router.register(r'ratings', views.RatingViewSet, basename='rating')
router.register(r'watchlist', views.WatchlistViewSet, basename='watchlist')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
]
