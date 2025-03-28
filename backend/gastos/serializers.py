from .models import Cartao, Categoria, Transacao
from rest_framework import serializers

# Serializer para o modelo Categoria
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

# Serializer para o modelo Cartao
class CartaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cartao
        fields = '__all__'

# Serializer para o modelo Transacao
class TransacaoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    cartao_nome = serializers.CharField(source='cartao.nome', read_only=True)
    
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    cartao = serializers.PrimaryKeyRelatedField(queryset=Cartao.objects.all())

    class Meta:
        model = Transacao
        fields = '__all__'

