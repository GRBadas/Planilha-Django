from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response  # Importação adicionada
from .models import Cartao, Categoria, Transacao
from .serializers import CartaoSerializer, CategoriaSerializer, TransacaoSerializer
from rest_framework.pagination import PageNumberPagination


class CartaoViewSet(viewsets.ModelViewSet):
    queryset = Cartao.objects.all()
    serializer_class = CartaoSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class TransacaoPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100


class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all().order_by('-data')
    serializer_class = TransacaoSerializer
    pagination_class = TransacaoPagination

    @action(detail=False, methods=['get'])
    def gastos_por_categoria(self, request):
        """
        Retorna os gastos agrupados por categoria
        """
        try:
            # Filtra apenas transações do tipo 'saida' (gastos)
            gastos = Transacao.objects.filter(tipo='saida')
            
            # Agrupa por categoria e soma os valores
            dados = gastos.values('categoria__nome').annotate(
                total=Sum('valor')
            ).order_by('-total')
            
            # Formata os dados para o frontend
            resultado = [
                {'categoria': item['categoria__nome'], 'total': float(item['total'])}
                for item in dados
            ]
            
            return Response(resultado, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )