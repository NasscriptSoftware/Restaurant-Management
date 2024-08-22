from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import TokenError, RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate, TruncHour
from restaurant_app.models import *
from restaurant_app.serializers import *


User = get_user_model()


class LoginViewSet(viewsets.ModelViewSet, TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class PasscodeLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasscodeLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(viewsets.ViewSet):
    permission_classes = (permissions.AllowAny,)

    @action(detail=False, methods=["post"])
    def logout(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Successfully logged out"}, status=status.HTTP_200_OK
            )
        except TokenError as e:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class DishViewSet(viewsets.ModelViewSet):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "price"]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        order_type = self.request.query_params.get("order_type", None)
        if order_type:
            queryset = queryset.filter(order_type=order_type)
        return queryset

    def get_queryset_by_time_range(self, time_range):
        end_date = timezone.now()
        if time_range == "day":
            start_date = end_date - timedelta(days=1)
        elif time_range == "week":
            start_date = end_date - timedelta(weeks=1)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
        elif time_range == "year":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)

        return self.queryset.filter(created_at__range=(start_date, end_date))

    @action(detail=False, methods=["get"])
    def sales_report(self, request):
        time_range = request.query_params.get("time_range", "month")
        queryset = self.get_queryset_by_time_range(time_range)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def dashboard_data(self, request):
        time_range = request.query_params.get("time_range", "month")
        queryset = self.get_queryset_by_time_range(time_range)

        daily_sales = (
            queryset.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(total_sales=Sum("total_amount"), order_count=Count("id"))
            .order_by("date")
        )

        total_income = (
            queryset.aggregate(total_income=Sum("total_amount"))["total_income"] or 0
        )

        popular_time_slots = (
            queryset.annotate(hour=TruncHour("created_at"))
            .values("hour")
            .annotate(order_count=Count("id"))
            .order_by("-order_count")[:5]
        )

        top_dishes = (
            OrderItem.objects.filter(order__in=queryset)
            .values(
                "dish__name",
                "dish__image",
            )
            .annotate(orders=Count("id"))
            .order_by("-orders")[:5]
        )

        category_sales = (
            OrderItem.objects.filter(order__in=queryset)
            .values("dish__category__name")
            .annotate(value=Sum(F("quantity") * F("dish__price")))
            .order_by("-value")
        )

        total_orders = queryset.count()

        avg_order_value = (
            queryset.aggregate(avg_value=Avg("total_amount"))["avg_value"] or 0
        )

        return Response(
            {
                "daily_sales": daily_sales,
                "total_income": total_income,
                "popular_time_slots": popular_time_slots,
                "top_dishes": top_dishes,
                "category_sales": category_sales,
                "total_orders": total_orders,
                "avg_order_value": avg_order_value,
            }
        )

    @action(detail=False, methods=["get"])
    def sales_trends(self, request):
        time_range = request.query_params.get("time_range", "month")
        current_queryset = self.get_queryset_by_time_range(time_range)

        end_date = timezone.now() - timedelta(days=1)
        if time_range == "day":
            start_date = end_date - timedelta(days=1)
            prev_start_date = start_date - timedelta(days=1)
        elif time_range == "week":
            start_date = end_date - timedelta(weeks=1)
            prev_start_date = start_date - timedelta(weeks=1)
        elif time_range == "month":
            start_date = end_date - timedelta(days=30)
            prev_start_date = start_date - timedelta(days=30)
        elif time_range == "year":
            start_date = end_date - timedelta(days=365)
            prev_start_date = start_date - timedelta(days=365)

        prev_queryset = self.queryset.filter(
            created_at__range=(prev_start_date, start_date)
        )

        current_stats = current_queryset.aggregate(
            total_income=Sum("total_amount"),
            total_orders=Count("id"),
            avg_order_value=Avg("total_amount"),
        )

        prev_stats = prev_queryset.aggregate(
            total_income=Sum("total_amount"),
            total_orders=Count("id"),
            avg_order_value=Avg("total_amount"),
        )

        def calculate_trend(current, previous):
            if previous and previous != 0:
                return ((current - previous) / previous) * 100
            return 0

        trends = {
            "total_income_trend": calculate_trend(
                current_stats["total_income"] or 0, prev_stats["total_income"] or 0
            ),
            "total_orders_trend": calculate_trend(
                current_stats["total_orders"] or 0, prev_stats["total_orders"] or 0
            ),
            "avg_order_value_trend": calculate_trend(
                current_stats["avg_order_value"] or 0,
                prev_stats["avg_order_value"] or 0,
            ),
        }

        return Response(trends)


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "notification marked as read"})

    @action(detail=False, methods=["get"])
    def unread(self, request):
        unread_notifications = self.queryset.filter(is_read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data)


class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        names = [item["name"] for item in serializer.data]
        return Response(names)


class TableViewSet(viewsets.ModelViewSet):
    serializer_class = TableSerializer

    def get_queryset(self):
        queryset = Table.objects.all()
        floor = self.request.query_params.get("floor")
        if floor:
            queryset = queryset.filter(floor__name=floor)
        return queryset


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessTypeViewSet(viewsets.ModelViewSet):
    queryset = MessType.objects.all()
    serializer_class = MessTypeSerializer


class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["mess_type", "is_custom", "created_by"]
    search_fields = ["name", "created_by"]

    def get_queryset(self):
        queryset = super().get_queryset()
        mess_type = self.request.query_params.get("mess_type")
        is_custom = self.request.query_params.get("is_custom")
        created_by = self.request.query_params.get("created_by")

        if mess_type:
            try:
                mess_type = int(mess_type)
                queryset = queryset.filter(mess_type=mess_type)
            except ValueError:
                raise ValueError("mess_type should be a number")

        if is_custom is not None:
            is_custom_bool = is_custom.lower() == "true"
            queryset = queryset.filter(is_custom=is_custom_bool)

        if created_by:
            queryset = queryset.filter(created_by=created_by)

        return queryset


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer


class MessViewSet(viewsets.ModelViewSet):
    queryset = Mess.objects.all()
    serializer_class = MessSerializer

    def create(self, request, *args, **kwargs):
        # Ensure no `id` is included in the creation data
        data = request.data.copy()
        data.pop("id", None)  # Remove `id` if present

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
