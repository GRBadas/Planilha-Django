from decimal import Decimal
from django.db import models
from django.forms import ValidationError

class Categoria(models.Model):
  nome = models.CharField(max_length=100, unique=True)

  def __str__(self):
    return self.nome
  
from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

class Cartao(models.Model):
    TIPOS_CARTAO = [
        ('credito', 'Crédito'),
        ('debito', 'Débito'),
    ]

    nome = models.CharField(
        max_length=100,
        verbose_name="Nome do Cartão",
        help_text="Ex: Nubank, Itaú, etc."
    )
    
    tipo = models.CharField(
        max_length=10,
        choices=TIPOS_CARTAO,
        verbose_name="Tipo de Cartão"
    )
    
    limite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Limite (R$)",
        help_text="Apenas para cartões de crédito"
    )
    
    saldo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        default=0.00,
        verbose_name="Saldo (R$)",
        help_text="Apenas para cartões de débito"
    )

    class Meta:
        verbose_name = "Cartão"
        verbose_name_plural = "Cartões"
        ordering = ['nome']

    def clean(self):
        """Validações adicionais antes de salvar"""
        super().clean()
        
        if self.tipo == 'credito':
            if self.limite is None or self.limite <= Decimal('0'):
                raise ValidationError({'limite': 'Cartão de crédito deve ter um limite positivo'})
            if self.saldo is not None:
                raise ValidationError({'saldo': 'Cartão de crédito não pode ter saldo'})
                
        elif self.tipo == 'debito':
            if self.limite is not None:
                raise ValidationError({'limite': 'Cartão de débito não pode ter limite'})
            if self.saldo is None:
                self.saldo = Decimal('0')

    def save(self, *args, **kwargs):
        """Garante consistência antes de salvar"""
        self.clean()  # Executa as validações
        super().save(*args, **kwargs)

    def __str__(self):
        tipo_display = dict(self.TIPOS_CARTAO).get(self.tipo)
        if self.tipo == 'credito':
            return f"{self.nome} ({tipo_display}) - Limite: R$ {self.limite:.2f}"
        return f"{self.nome} ({tipo_display}) - Saldo: R$ {self.saldo:.2f}"
    
    def registrar_transacao(self, valor: Decimal, tipo: str):
        """
        Registra uma transação no cartão com todas as validações necessárias
        
        Args:
            valor: Valor decimal positivo da transação
            tipo: 'entrada' ou 'saida'
        
        Raises:
            ValidationError: Se alguma regra for violada
        """
        if not isinstance(valor, Decimal):
            valor = Decimal(str(valor))
            
        if valor <= Decimal('0'):
            raise ValidationError("Valor deve ser positivo")

        if tipo not in ['entrada', 'saida']:
            raise ValidationError("Tipo de transação inválido")

        if self.tipo == 'credito':
            if tipo == 'entrada':
                raise ValidationError("Cartão de crédito não aceita entradas")
                
            if valor > self.limite:
                raise ValidationError("Limite insuficiente")
                
            self.limite -= valor
            self.save()
            
        elif self.tipo == 'debito':
            if tipo == 'saida' and valor > self.saldo:
                raise ValidationError("Saldo insuficiente")
                
            self.saldo += valor if tipo == 'entrada' else -valor
            self.save()

    def ajustar_limite(self, novo_limite: Decimal):
        """Método específico para ajuste de limite (apenas crédito)"""
        if self.tipo != 'credito':
            raise ValidationError("Apenas cartões de crédito podem ter limite ajustado")
            
        if not isinstance(novo_limite, Decimal):
            novo_limite = Decimal(str(novo_limite))
            
        if novo_limite <= Decimal('0'):
            raise ValidationError("Limite deve ser positivo")
            
        self.limite = novo_limite
        self.save()

  
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
