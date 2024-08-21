from django.contrib import admin
from .models import DeliveryDriver, DeliveryOrder

admin.site.register(DeliveryDriver)
admin.site.register(DeliveryOrder)
