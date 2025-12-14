from django.apps import AppConfig
from django.db.backends.signals import connection_created
from django.dispatch import receiver


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.api'

    def ready(self):
        # Enable WAL mode for SQLite to improve concurrent access
        @receiver(connection_created)
        def enable_sqlite_wal_mode(sender, connection, **kwargs):
            if connection.vendor == 'sqlite':
                cursor = connection.cursor()
                cursor.execute('PRAGMA journal_mode=WAL;')
                cursor.execute('PRAGMA busy_timeout=20000;')  # 20 second timeout
                cursor.close()
