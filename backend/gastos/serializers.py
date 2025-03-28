from .models import Cartao, Categoria, Transacao
from rest_framework import serializers

# Serializer para o modelo Categoria
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class CartaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cartao
        fields = '__all__'

    def validate(self, data):
        tipo = data.get("tipo")
        limite = data.get("limite")
        saldo = data.get("saldo")

        if tipo == "credito" and saldo is not None:
            raise serializers.ValidationError("Cartões de crédito não devem ter saldo.")
        if tipo == "debito" and limite is not None:
            raise serializers.ValidationError("Cartões de débito não devem ter limite.")

        return data

# Serializer para o modelo Transacao
class TransacaoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    cartao = serializers.PrimaryKeyRelatedField(queryset=Cartao.objects.all())

    class Meta:
        model = Transacao
        fields = '__all__'
