from django.db import models
from django.utils import timezone
import datetime


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
    name = models.CharField(max_length=100)
    mobile_no = models.CharField(max_length=15, blank=True, null=True)
    opening_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date = models.DateField(default=datetime.date.today)     
    group = models.ForeignKey(MainGroup, on_delete=models.CASCADE, related_name='ledgers')
    debit_credit = models.CharField(max_length=6, choices=[('DEBIT', 'Debit'), ('CREDIT', 'Credit')], blank=True)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    PAY_IN = 'Pay In'
    PAY_OUT = 'Pay Out'

    TRANSACTION_TYPE_CHOICES = [
        (PAY_IN, 'Pay In'),
        (PAY_OUT, 'Pay Out'),
    ]

    ledger = models.ForeignKey(Ledger, on_delete=models.CASCADE, related_name='ledger_transactions')  
    particulars = models.ForeignKey(Ledger, on_delete=models.CASCADE, related_name='particulars_transactions') 
    date = models.DateField()
    transaction_type = models.CharField(max_length=7, choices=TRANSACTION_TYPE_CHOICES)
    debit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    credit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remarks = models.TextField(blank=True, null=True)
    voucher_no = models.PositiveIntegerField(unique=True, editable=False)  

    def save(self, *args, **kwargs):
        if not self.voucher_no:
            last_voucher = Transaction.objects.all().order_by('voucher_no').last()
            if last_voucher:
                self.voucher_no = last_voucher.voucher_no + 1
            else:
                self.voucher_no = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ledger.name} - {self.transaction_type} - {self.date} - Voucher No: {self.voucher_no}"



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
