from django.db import models

class Categoria(models.Model):
  nome = models.CharField(max_length=100, unique=True)

  def __str__(self):
    return self.nome
  
class Cartao(models.Model):
    TIPOS_CARTAO = [
        ('credito', 'Crédito'),
        ('debito', 'Débito'),
    ]

    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPOS_CARTAO)
    limite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    saldo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.tipo == 'credito':
            self.saldo = None  # Crédito não tem saldo
        elif self.tipo == 'debito':
            self.limite = None  # Débito não tem limite
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.tipo})"

  
class Transacao(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]

    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField()
    tipo = models.CharField(max_length=7, choices=TIPO_CHOICES)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    cartao = models.ForeignKey(Cartao, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.descricao} - {self.valor}"

    def salvar_transacao(self):
        """Atualiza o saldo ou limite do cartão após a transação"""
        if self.cartao:
            if self.cartao.tipo == 'credito' and self.tipo == 'entrada':
                raise ValueError("Não é permitido registrar entrada para cartões de crédito.")
            self.cartao.atualizar_saldo(self.valor, self.tipo)
