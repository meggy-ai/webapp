"""
Django base settings for Bruno PA project.
"""

import os
from pathlib import Path
from decouple import config
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-development-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    'daphne',  # Must be first for WebSocket support
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    'django_extensions',
    'channels',
    
    # Local apps
    'apps.accounts',
    'apps.agents',
    'apps.chat',
    'apps.api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
# Support both DATABASE_URL and individual DB_* environment variables
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    # Use DATABASE_URL if provided
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    # Fallback to individual database environment variables
    # Support flexible database engine selection
    DB_ENGINE = config('DB_ENGINE', default='postgresql')
    
    # Map engine types to Django backend strings
    ENGINE_MAPPING = {
        'postgresql': 'django.db.backends.postgresql',
        'sqlite3': 'django.db.backends.sqlite3',
        'mysql': 'django.db.backends.mysql',
    }
    
    django_engine = ENGINE_MAPPING.get(DB_ENGINE, 'django.db.backends.postgresql')
    
    if DB_ENGINE == 'sqlite3':
        # SQLite configuration
        DATABASES = {
            'default': {
                'ENGINE': django_engine,
                'NAME': BASE_DIR / config('DB_NAME', default='db.sqlite3'),
            }
        }
    else:
        # PostgreSQL/MySQL configuration
        DATABASES = {
            'default': {
                'ENGINE': django_engine,
                'NAME': config('DB_NAME', default='bruno_pa'),
                'USER': config('DB_USER', default='postgres'),
                'PASSWORD': config('DB_PASSWORD', default='postgres'),
                'HOST': config('DB_HOST', default='localhost'),
                'PORT': config('DB_PORT', default='5432'),
            }
        }

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.api.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

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

# JWT Settings
JWT_SECRET_KEY = config('JWT_SECRET_KEY', default=SECRET_KEY)
JWT_ALGORITHM = config('JWT_ALGORITHM', default='HS256')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = config('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', default=60, cast=int)
JWT_REFRESH_TOKEN_EXPIRE_DAYS = config('JWT_REFRESH_TOKEN_EXPIRE_DAYS', default=7, cast=int)

# LLM Provider Settings
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
OLLAMA_BASE_URL = config('OLLAMA_BASE_URL', default='http://localhost:11434')
DEFAULT_LLM_PROVIDER = config('DEFAULT_LLM_PROVIDER', default='openai')
DEFAULT_MODEL = config('DEFAULT_MODEL', default='gpt-4')

# Bruno Integration Settings
BRUNO_LOG_LEVEL = config('BRUNO_LOG_LEVEL', default='INFO')

# Channels Configuration
ASGI_APPLICATION = 'config.asgi.application'

# Redis Configuration for Django Channels (WebSockets)
REDIS_URL = config('REDIS_URL', default='redis://127.0.0.1:6379/0')

CHANNEL_LAYERS = {
    'default': {
        # Use Redis for multi-process WebSocket communication
        # Install Redis and channels-redis: pip install channels-redis
        # Start Redis: redis-server
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [REDIS_URL],
        },
    },
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': config('LOG_LEVEL', default='INFO'),
    },
}
