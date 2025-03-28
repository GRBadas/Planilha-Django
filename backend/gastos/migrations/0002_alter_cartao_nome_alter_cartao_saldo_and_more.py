# Generated by Django 5.1.7 on 2025-03-28 03:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gastos', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cartao',
            name='nome',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='cartao',
            name='saldo',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AlterField(
            model_name='cartao',
            name='tipo',
            field=models.CharField(choices=[('credito', 'Crédito'), ('debito', 'Débito')], max_length=10),
        ),
        migrations.AlterField(
            model_name='transacao',
            name='tipo',
            field=models.CharField(choices=[('entrada', 'Entrada'), ('saida', 'Saída')], max_length=7),
        ),
    ]
