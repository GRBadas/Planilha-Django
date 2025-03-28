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
    categoria = CategoriaSerializer()
    cartao = CartaoSerializer()

    class Meta:
        model = Transacao
        fields = '__all__'