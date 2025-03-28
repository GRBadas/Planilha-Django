from django.shortcuts import render
from rest_framework import viewsets
from .models import Cartao, Categoria, Transacao
from .serializers import CartaoSerializer, CategoriaSerializer, TransacaoSerializer

class CartaoViewSet(viewsets.ModelViewSet):
  queryset = Cartao.objects.all()
  serializer_class = CartaoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
  queryset = Categoria.objects.all()
  serializer_class = CategoriaSerializer
  
class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer