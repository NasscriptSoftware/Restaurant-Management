from rest_framework import serializers
from .models import NatureGroup, MainGroup, Ledger, Transaction, IncomeStatement, BalanceSheet

class NatureGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = NatureGroup
        fields = '__all__'

class MainGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainGroup
        fields = '__all__'

class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class IncomeStatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeStatement
        fields = '__all__'

class BalanceSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = BalanceSheet
        fields = '__all__'
