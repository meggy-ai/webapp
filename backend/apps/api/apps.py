from django.apps import AppConfig
from django.db.backends.signals import connection_created
from django.dispatch import receiver


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.api'

    def ready(self):
        # Enable SQLite-specific optimizations for better concurrent access
        @receiver(connection_created)
        def enable_sqlite_optimizations(sender, connection, **kwargs):
            if connection.vendor == 'sqlite':
                cursor = connection.cursor()
                # Enable WAL mode for better concurrent read/write performance
                cursor.execute('PRAGMA journal_mode=WAL;')
                # Set busy timeout for handling database locks
                cursor.execute('PRAGMA busy_timeout=20000;')  # 20 second timeout
                # Enable foreign key constraints (disabled by default in SQLite)
                cursor.execute('PRAGMA foreign_keys=ON;')
                cursor.close()
                
                # Optional: Log SQLite optimization setup for debugging
                import logging
                logger = logging.getLogger(__name__)
                logger.info('SQLite optimizations enabled: WAL mode, busy timeout, foreign keys')
