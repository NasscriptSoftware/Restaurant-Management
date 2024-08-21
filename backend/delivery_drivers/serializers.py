from rest_framework import serializers
from .models import DeliveryDriver, DeliveryOrder


class DeliveryDriverSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    mobile_number = serializers.CharField(source="user.mobile_number", read_only=True)

    class Meta:
        model = DeliveryDriver
        fields = ["id", "username", "email", "mobile_number", "is_active", "is_available"]


class DeliveryOrderSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.user.username", read_only=True)

    class Meta:
        model = DeliveryOrder
        fields = [
            "id",
            "driver",
            "driver_name",
            "status",
            "order_details",
            "created_at",
            "updated_at",
        ]
