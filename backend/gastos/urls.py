from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartaoViewSet, CategoriaViewSet, TransacaoViewSet

router = DefaultRouter()
router.register(r'cartoes', CartaoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'transacoes', TransacaoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]