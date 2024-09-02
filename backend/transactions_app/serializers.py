from rest_framework import serializers
from .models import NatureGroup, MainGroup, Ledger, Transaction, IncomeStatement, BalanceSheet

class NatureGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = NatureGroup
        fields = '__all__'

class MainGroupSerializer(serializers.ModelSerializer):
    nature_group = NatureGroupSerializer(read_only=True)  
    class Meta:
        model = MainGroup
        fields = '__all__'

class LedgerSerializer(serializers.ModelSerializer):
    group = MainGroupSerializer(read_only=True)  
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=MainGroup.objects.all(), write_only=True, source='group'
    )

    class Meta:
        model = Ledger
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    ledger_id = serializers.PrimaryKeyRelatedField(queryset=Ledger.objects.all(), source='ledger', write_only=True)
    ledger = LedgerSerializer(read_only=True)
    particulars_id = serializers.PrimaryKeyRelatedField(queryset=Ledger.objects.all(), source='particulars', write_only=True)
    particulars =  LedgerSerializer(read_only=True)
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
