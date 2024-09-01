from rest_framework import viewsets
from .models import (
    NatureGroup,
    MainGroup, 
    Ledger, 
    Transaction,
    IncomeStatement, 
    BalanceSheet)
from .serializers import (
     NatureGroupSerializer, 
     MainGroupSerializer, 
     LedgerSerializer, 
     TransactionSerializer, 
     IncomeStatementSerializer, 
     BalanceSheetSerializer)
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.dateparse import parse_date

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

    @action(detail=False, methods=['get'])
    def ledger_report(self, request):
        ledger_id = request.query_params.get('ledger', None)
        from_date = request.query_params.get('from_date', None)
        to_date = request.query_params.get('to_date', None)

        # Ensure ledger_id is provided
        if not ledger_id:
            return Response([])

        # Filter transactions by ledger
        queryset = self.queryset.filter(ledger__id=ledger_id)

        # If no transactions match the ledger, return an empty list
        if not queryset.exists():
            return Response([])

        # Parse the from_date and to_date strings into date objects
        if from_date:
            from_date = parse_date(from_date)
        if to_date:
            to_date = parse_date(to_date)

        # Filter further by date range if provided
        if from_date and to_date:
            queryset = queryset.filter(date__range=(from_date, to_date))
        elif from_date:
            queryset = queryset.filter(date__gte=from_date)
        elif to_date:
            queryset = queryset.filter(date__lte=to_date)

        # Serialize the filtered queryset
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class IncomeStatementViewSet(viewsets.ModelViewSet):
    queryset = IncomeStatement.objects.all()
    serializer_class = IncomeStatementSerializer

class BalanceSheetViewSet(viewsets.ModelViewSet):
    queryset = BalanceSheet.objects.all()
    serializer_class = BalanceSheetSerializer
