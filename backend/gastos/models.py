from django.db import models

class Categoria(models.Model):
  nome = models.CharField(max_length=100, unique=True)

  def __str__(self):
    return self.nome
  
class Cartao(models.Model):
    CARTAO_CHOICES = [
        ('debito', 'Débito'),
        ('credito', 'Crédito'),
    ]
    
    nome = models.CharField(max_length=100, unique=True)
    tipo = models.CharField(max_length=7, choices=CARTAO_CHOICES)  # Débito ou Crédito
    limite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Apenas para crédito
    saldo = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Apenas para débito

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"

    def atualizar_saldo(self, valor, tipo_transacao):
        """Atualiza o saldo com base na transação (entrada ou saída)"""
        if self.tipo == 'debito':
            if tipo_transacao == 'saida':  # Só pode sair do débito
                if self.saldo >= valor:
                    self.saldo -= valor
                else:
                    raise ValueError("Saldo insuficiente para a transação de débito.")
            elif tipo_transacao == 'entrada':  # Entradas aumentam o saldo
                self.saldo += valor
        elif self.tipo == 'credito':
            if tipo_transacao == 'saida':  # Saídas no crédito descontam do limite
                if self.limite >= valor:
                    self.limite -= valor
                else:
                    raise ValueError("Limite insuficiente para a transação de crédito.")

  
class Transacao(models.Model):
    TIPO_CHOICES = [
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
