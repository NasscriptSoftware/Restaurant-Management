from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from restaurant_app.views import (
    CategoryViewSet,
    DishViewSet,
    OrderViewSet,
    NotificationViewSet,
    BillViewSet,
    LoginViewSet,
    PasscodeLoginView,
    LogoutView,
    FloorViewSet,
    TableViewSet,
    CouponViewSet,
    MenuViewSet,
    MenuItemViewSet,
    MessViewSet,
    MessTypeViewSet
)
from delivery_drivers.views import (
    DeliveryDriverViewSet,
    DeliveryOrderViewSet,
)


router = DefaultRouter()

router.register(r'login', LoginViewSet, basename='login')
router.register(r'dishes', DishViewSet, basename='dishes')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'bills', BillViewSet, basename='bills')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'floors', FloorViewSet, basename='floors')
router.register(r'tables', TableViewSet, basename='tables')
router.register(r'coupons', CouponViewSet)
router.register(r'mess-types', MessTypeViewSet)
router.register(r'menus', MenuViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'messes', MessViewSet)

# Delivery Driver URLs
router.register(r'delivery-drivers', DeliveryDriverViewSet, basename='delivery_drivers')
router.register(r'delivery-orders', DeliveryOrderViewSet, basename='delivery_orders')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/login-passcode/', PasscodeLoginView.as_view(), name='login-passcode'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view({'post': 'logout'}), name='logout'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
