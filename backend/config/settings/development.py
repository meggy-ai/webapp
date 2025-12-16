"""
Development settings for Bruno PA project.
"""

from .base import *
import os

DEBUG = True

# Database configuration is inherited from base.py using decouple
# All database settings are loaded from .env file

INSTALLED_APPS += [
    'debug_toolbar',
]

MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')

INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# Development-specific REST Framework settings
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] += [
    'rest_framework.renderers.BrowsableAPIRenderer',
]

# Email backend for development (console output)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Development JWT Settings (longer expiration for convenience)
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 30  # 30 days

# More permissive CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding', 
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Redis configuration is inherited from base.py using decouple
# REDIS_URL can be set in .env file
