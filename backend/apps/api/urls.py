from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .views import UserViewSet, AgentViewSet, ConversationViewSet, MessageViewSet, TimerViewSet
from .auth_views import register, login, refresh_token, logout

@api_view(['GET'])
def api_root(request):
    """Root API endpoint for health check"""
    return Response({
        'message': 'Bruno PA API is running',
        'version': '1.0.0',
        'status': 'healthy'
    })

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'agents', AgentViewSet, basename='agent')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'timers', TimerViewSet, basename='timer')

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api_root'),
    
    # Authentication endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/refresh/', refresh_token, name='refresh_token'),
    path('auth/logout/', logout, name='logout'),
    
    # API endpoints
    path('', include(router.urls)),
]
