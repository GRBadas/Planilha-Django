from django import forms
from .models import Cartao

class CartaoForm(forms.ModelForm):
    class Meta:
        model = Cartao
        fields = ['nome', 'tipo', 'limite', 'saldo']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Inicialmente, esconde os campos indevidos conforme o tipo
        if self.instance and self.instance.pk:
            if self.instance.tipo == 'credito':
                self.fields['saldo'].widget = forms.HiddenInput()
                self.fields['saldo'].required = False
            elif self.instance.tipo == 'debito':
                self.fields['limite'].widget = forms.HiddenInput()
                self.fields['limite'].required = False
