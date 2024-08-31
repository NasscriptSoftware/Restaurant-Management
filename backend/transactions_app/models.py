from django.db import models

class NatureGroup(models.Model): # This gorup as main group
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class MainGroup(models.Model):  # This group as sub_group
    name = models.CharField(max_length=100, unique=True)
    nature_group = models.ForeignKey(NatureGroup, on_delete=models.CASCADE, related_name='main_groups')

    def __str__(self):
        return self.name

class Ledger(models.Model):
    name = models.CharField(max_length=100, unique=True)
    mobile_no = models.CharField(max_length=15, blank=True, null=True)
    opening_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    group = models.ForeignKey(MainGroup, on_delete=models.CASCADE, related_name='ledgers')
    debit_credit = models.CharField(max_length=6, choices=[('DEBIT', 'Debit'), ('CREDIT', 'Credit')], default='DEBIT')

    def __str__(self):
        return self.name


class Transaction(models.Model):
    PAY_IN = 'Pay In'
    PAY_OUT = 'Pay Out'

    TRANSACTION_TYPE_CHOICES = [
        (PAY_IN, 'Pay In'),
        (PAY_OUT, 'Pay Out'),
    ]

    ledger = models.ForeignKey(Ledger, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    transaction_type = models.CharField(max_length=7, choices=TRANSACTION_TYPE_CHOICES)
    debit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    credit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.ledger.name} - {self.transaction_type} - {self.date}"


class IncomeStatement(models.Model):
    SALES = 'Sales'
    INDIRECT_INCOME = 'Indirect Income'

    INCOME_TYPE_CHOICES = [
        (SALES, 'Sales'),
        (INDIRECT_INCOME, 'Indirect Income'),
        # Add other types as needed
    ]

    ledger = models.ForeignKey(Ledger, on_delete=models.CASCADE, related_name='income_statements')
    income_type = models.CharField(max_length=20, choices=INCOME_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.ledger.name} - {self.income_type} - {self.amount}"


class BalanceSheet(models.Model):
    ASSET = 'Asset'
    LIABILITY = 'Liability'

    BALANCE_TYPE_CHOICES = [
        (ASSET, 'Asset'),
        (LIABILITY, 'Liability'),
        # Add other types as needed
    ]

    ledger = models.ForeignKey(Ledger, on_delete=models.CASCADE, related_name='balance_sheets')
    balance_type = models.CharField(max_length=20, choices=BALANCE_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.ledger.name} - {self.balance_type} - {self.amount}"
