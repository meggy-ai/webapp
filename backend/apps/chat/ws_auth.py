"""
WebSocket authentication middleware for JWT tokens.
"""
import logging
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from apps.accounts.models import User
from apps.accounts.jwt import verify_token

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token):
    """Get user from JWT token."""
    try:
        payload = verify_token(token)
        if payload:
            user_id = payload.get('user_id')
            if user_id:
                return User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning(f"User not found for token")
    except Exception as e:
        logger.error(f"Error verifying JWT token: {e}")
    
    return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens.
    Token can be passed as query parameter: ?token=<jwt_token>
    """
    
    async def __call__(self, scope, receive, send):
        # Get token from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Helper function to wrap the inner application."""
    return JWTAuthMiddleware(inner)
