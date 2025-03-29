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
    
    class Meta:
        model = Transacao
        fields = '__all__'
        extra_kwargs = {
            'valor': {'required': True},
            'data': {'required': True},
            'tipo': {'required': True},
            'categoria': {'required': True}
        }

    def validate(self, data):
        """Validação adicional dos dados"""
        if data.get('cartao') and data['cartao'].tipo == 'credito' and data.get('tipo') == 'entrada':
            raise serializers.ValidationError("Cartão de crédito não aceita entradas")
        return data

    def create(self, validated_data):
        try:
            # Apenas cria a transação
            transacao = Transacao.objects.create(**validated_data)
            return transacao
        except Exception as e:
            raise serializers.ValidationError(str(e))

