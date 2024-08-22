from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from restaurant_app.models import Order

User = get_user_model()


class DeliveryDriver(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="driver_profile"
    )
    is_active = models.BooleanField(default=False)
    is_available = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {'Active' if self.is_active else 'Inactive'}"


class DeliveryOrder(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("in_progress", "In Progress"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )

    driver = models.ForeignKey(
        DeliveryDriver, on_delete=models.SET_NULL, null=True, related_name="orders"
    )
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="delivery_order"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self):
        return f"Order {self.id} - {self.status}"

    def update_order_status(self):
        status_mapping = {
            "pending": "pending",
            "accepted": "approved",
            "in_progress": "approved",
            "delivered": "delivered",
            "cancelled": "cancelled",
        }
        self.order.status = status_mapping.get(self.status, self.order.status)
        self.order.save()

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = DeliveryOrder.objects.filter(pk=self.pk).values("status").first()

        super().save(*args, **kwargs)

        if is_new or (old_status and old_status["status"] != self.status):
            self.update_order_status()


@receiver(post_save, sender=Order)
def create_delivery_order(sender, instance, created, **kwargs):
    if created and instance.is_delivery_order():
        driver = None
        if instance.delivery_driver_id:
            driver = DeliveryDriver.objects.filter(
                id=instance.delivery_driver_id
            ).first()
            print(f"------------------------- {driver} ------------------------------")
        DeliveryOrder.objects.create(order=instance, driver=driver)
