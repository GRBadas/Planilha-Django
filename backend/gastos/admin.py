from django.contrib import admin

from backend.gastos.models import Cartao, Categoria, Transacao

class CartaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo', 'limite', 'saldo')

class TransacaoAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'valor', 'data', 'tipo', 'categoria', 'cartao')
    def save_model(self, request, obj, form, change):
        try:
            obj.salvar_transacao()
            super().save_model(request, obj, form, change)
        except ValueError as e:
            # Exibe a mensagem de erro no painel admin
            self.message_user(request, str(e), level="error")

admin.site.register(Categoria)
admin.site.register(Cartao, CartaoAdmin)
admin.site.register(Transacao, TransacaoAdmin)

