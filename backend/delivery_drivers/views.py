from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DeliveryDriver, DeliveryOrder
from .serializers import DeliveryDriverSerializer, DeliveryOrderSerializer


class DeliveryDriverViewSet(viewsets.ModelViewSet):
    queryset = DeliveryDriver.objects.all()
    serializer_class = DeliveryDriverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return DeliveryDriver.objects.all()
        return DeliveryDriver.objects.filter(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def toggle_active(self, request, pk=None):
        driver = self.get_object()
        driver.is_active = not driver.is_active
        driver.save()
        return Response({"status": "active status updated"})

    @action(detail=True, methods=["patch"])
    def toggle_available(self, request, pk=None):
        driver = self.get_object()
        driver.is_available = not driver.is_available
        driver.save()
        return Response({"status": "availability status updated"})


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.all()
    serializer_class = DeliveryOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return DeliveryOrder.objects.all()
        return DeliveryOrder.objects.filter(driver__user=self.request.user)

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status in dict(DeliveryOrder.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({"status": "order status updated"})
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
