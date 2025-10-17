from django.contrib import admin
from django.contrib.auth.models import User
from .models import Movie, Rating

# Register your models here.
admin.site.register(Movie)
admin.site.register(Rating)
admin.site.register(User)
