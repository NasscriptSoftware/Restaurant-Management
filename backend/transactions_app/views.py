from rest_framework import viewsets,status
from django.db import transaction 
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
     BalanceSheetSerializer,
     )
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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        transaction1_data = request.data.get('transaction1')
        transaction2_data = request.data.get('transaction2')

        if not transaction1_data or not transaction2_data:
            return Response({"error": "Both transaction1 and transaction2 are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate the next voucher number
        last_transaction = Transaction.objects.order_by('-voucher_no').first()
        next_voucher_no = (last_transaction.voucher_no + 1) if last_transaction else 1

        # Assign the generated voucher number to both transactions
        transaction1_data['voucher_no'] = next_voucher_no
        transaction2_data['voucher_no'] = next_voucher_no

        serializer1 = self.get_serializer(data=transaction1_data)
        serializer1.is_valid(raise_exception=True)
        self.perform_create(serializer1)

        serializer2 = self.get_serializer(data=transaction2_data)
        serializer2.is_valid(raise_exception=True)
        self.perform_create(serializer2)

        return Response(serializer1.data, status=status.HTTP_201_CREATED) 

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
