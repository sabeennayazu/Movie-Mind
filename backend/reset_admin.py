import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moviebackend.settings')
django.setup()

from django.contrib.auth.models import User

# Delete any existing superuser
User.objects.filter(is_superuser=True).delete()

# Create a new superuser
admin_username = 'admin'
admin_password = 'admin123'
admin_email = 'admin@example.com'

User.objects.create_superuser(
    username=admin_username,
    email=admin_email,
    password=admin_password
)

print(f"Created new admin user:")
print(f"Username: {admin_username}")
print(f"Password: {admin_password}")
print(f"Email: {admin_email}")
print("\nYou can use these credentials to log in to the admin site at http://localhost:8000/admin/")
print("and also for API authentication.")
