from django.shortcuts import render
from rest_framework import viewsets
from .models import Cartao, Categoria, Transacao
from .serializers import CartaoSerializer, CategoriaSerializer, TransacaoSerializer
from rest_framework.pagination import PageNumberPagination

class CartaoViewSet(viewsets.ModelViewSet):
  queryset = Cartao.objects.all()
  serializer_class = CartaoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
  queryset = Categoria.objects.all()
  serializer_class = CategoriaSerializer
  
class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    

class TransacaoPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100

class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all().order_by('-data')
    serializer_class = TransacaoSerializer
    pagination_class = TransacaoPagination