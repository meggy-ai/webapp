"""
Create a test user for testing.
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.accounts.models import User

# Create test user
email = "test@example.com"
password = "testpass123"
name = "Test User"

# Check if user exists
if User.objects.filter(email=email).exists():
    print(f"✅ User {email} already exists")
else:
    user = User.objects.create_user(
        email=email,
        password=password,
        name=name
    )
    print(f"✅ Created user: {email}")
    print(f"   Password: {password}")

print("\n💡 Use these credentials to test the proactive messaging system:")
print(f"   Email: {email}")
print(f"   Password: {password}")
