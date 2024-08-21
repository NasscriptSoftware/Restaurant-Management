from django.contrib import admin
from restaurant_app.models import *

admin.site.register(User)
admin.site.register(Category)
admin.site.register(Dish)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Bill)
admin.site.register(Notification)
admin.site.register(Floor)
admin.site.register(Table)
admin.site.register(Coupon)


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "day_of_week",
        "sub_total",
        "is_custom",
        "mess_type",
        "created_by",
    )
    list_filter = ("day_of_week", "is_custom", "mess_type", "created_by")
    fields = (
        "name",
        "day_of_week",
        "sub_total",
        "is_custom",
        "mess_type",
        "created_by",
    )
    search_fields = ("name", "day_of_week", "mess_type__name", "created_by")


admin.site.register(MenuItem)
admin.site.register(Mess)
admin.site.register(MessType)
