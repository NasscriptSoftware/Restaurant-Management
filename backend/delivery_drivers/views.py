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
            return DeliveryDriver.objects.filter(is_active=True, is_available=True)
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

        # Check if the driver has any active orders before allowing them to become available
        active_orders = DeliveryOrder.objects.filter(
            driver=driver, status__in=["accepted", "in_progress"]
        )

        if active_orders.exists() and not driver.is_available:
            return Response(
                {"error": "Cannot set availability to True while having active orders"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        delivery_order = self.get_object()
        new_status = request.data.get("status")
        if new_status in dict(DeliveryOrder.STATUS_CHOICES):
            old_status = delivery_order.status
            delivery_order.status = new_status
            delivery_order.save()

            # Update driver availability if status changes to 'accepted' or 'in_progress'
            if new_status in ["accepted", "in_progress"]:
                self.update_driver_availability(delivery_order.driver, False)

            # If status was 'accepted' or 'in_progress' and now it's not, check if driver can be made available
            elif old_status in ["accepted", "in_progress"] and new_status not in [
                "accepted",
                "in_progress",
            ]:
                self.check_and_update_driver_availability(delivery_order.driver)

            return Response({"status": "Delivery order status updated"})
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

    def update_driver_availability(self, driver, is_available):
        if driver:
            driver.is_available = is_available
            driver.save()

    def check_and_update_driver_availability(self, driver):
        if driver:
            # Check if the driver has any other active orders
            active_orders = DeliveryOrder.objects.filter(
                driver=driver, status__in=["accepted", "in_progress"]
            ).exclude(id=self.get_object().id)

            if not active_orders.exists():
                driver.is_available = True
                driver.save()
