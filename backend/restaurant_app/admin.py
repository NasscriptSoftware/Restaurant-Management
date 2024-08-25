from unfold.admin import ModelAdmin as UnflodModelAdmin
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.contrib import admin
from django.contrib.auth.models import Group
from restaurant_app.models import *

admin.site.unregister(Group)
admin.site.unregister(BlacklistedToken)
admin.site.unregister(OutstandingToken)

admin.site.register(User, UnflodModelAdmin)
admin.site.register(Category, UnflodModelAdmin)
admin.site.register(Dish, UnflodModelAdmin)
admin.site.register(Order, UnflodModelAdmin)
admin.site.register(OrderItem, UnflodModelAdmin)
admin.site.register(Bill, UnflodModelAdmin)
admin.site.register(Notification, UnflodModelAdmin)
admin.site.register(Floor, UnflodModelAdmin)
admin.site.register(Table, UnflodModelAdmin)
admin.site.register(Coupon, UnflodModelAdmin)

@admin.register(Menu)
class MenuAdmin(UnflodModelAdmin):
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

admin.site.register(MenuItem, UnflodModelAdmin)
admin.site.register(Mess, UnflodModelAdmin)
admin.site.register(MessType, UnflodModelAdmin)

admin.site.register(CreditUser, UnflodModelAdmin)
admin.site.register(CreditOrder, UnflodModelAdmin)
