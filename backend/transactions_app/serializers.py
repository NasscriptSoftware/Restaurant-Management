from rest_framework import serializers
from .models import (
    NatureGroup,
    MainGroup,
    Ledger, 
    Transaction,
    IncomeStatement,
    BalanceSheet,
    ShareUsers,
    ShareUserTransaction,
    ProfitLossShareTransaction     
    )

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

#ShareManagement
class ShareUserManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareUsers
        fields = ['id', 'name', 'mobile_no', 'category', 'profitlose_share', 'address']

class ShareUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareUsers
        fields = ['id', 'name', 'category']

class ShareUserTransactionSerializer(serializers.ModelSerializer):
    share_user = ShareUserSerializer()
    
    class Meta:
        model = ShareUserTransaction
        fields = ['share_user', 'profit_lose', 'percentage', 'amount']

class ProfitLossShareTransactionSerializer(serializers.ModelSerializer):
    share_users = ShareUserTransactionSerializer(many=True)

    class Meta:
        model = ProfitLossShareTransaction
        fields = ['created_date', 'transaction_no', 'period_from', 'period_to', 'total_percentage', 'total_amount', 'status', 'profit', 'loss', 'share_users']

    def create(self, validated_data):
        share_users_data = validated_data.pop('share_users')
        transaction = ProfitLossShareTransaction.objects.create(**validated_data)

        total_percentage = 0
        total_amount = 0

        for user_data in share_users_data:
            share_user = user_data['share_user']
            ShareUserTransaction.objects.create(
                transaction=transaction,
                share_user=ShareUsers.objects.get(id=share_user['id']),
                profit_lose=user_data['profit_lose'],
                percentage=user_data['percentage'],
                amount=user_data['amount']
            )
            total_percentage += user_data['percentage']
            total_amount += user_data['amount']

        # Update total_percentage and total_amount
        transaction.total_percentage = total_percentage
        transaction.total_amount = total_amount
        transaction.save()

        return transaction

