from rest_framework import viewsets
from .models import NatureGroup, MainGroup, Ledger, Transaction, IncomeStatement, BalanceSheet
from .serializers import NatureGroupSerializer, MainGroupSerializer, LedgerSerializer, TransactionSerializer, IncomeStatementSerializer, BalanceSheetSerializer

class NatureGroupViewSet(viewsets.ModelViewSet):
    queryset = NatureGroup.objects.all()
    serializer_class = NatureGroupSerializer

class MainGroupViewSet(viewsets.ModelViewSet):
    queryset = MainGroup.objects.all()
    serializer_class = MainGroupSerializer

class LedgerViewSet(viewsets.ModelViewSet):
    queryset = Ledger.objects.all()
    serializer_class = LedgerSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

class IncomeStatementViewSet(viewsets.ModelViewSet):
    queryset = IncomeStatement.objects.all()
    serializer_class = IncomeStatementSerializer

class BalanceSheetViewSet(viewsets.ModelViewSet):
    queryset = BalanceSheet.objects.all()
    serializer_class = BalanceSheetSerializer
