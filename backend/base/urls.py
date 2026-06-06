from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register-user'),
    path('user-profile/', views.user_profile, name='user-profile'),
    path('login/', views.login_user, name='login-user'),
    path('products/', views.product_list, name='product-list'),
    path('products/<int:pk>/', views.get_product_by_id, name='get-product-by-id'),
    path('cart/', views.read_cart, name='read-cart'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/<int:pk>/update/', views.update_cart_item, name='update-cart-item-legacy'),
    path('cart/update/<int:pk>/', views.update_cart_item, name='update-cart-item'),
    path('cart/remove/<int:pk>/', views.remove_from_cart, name='remove-from-cart'),
    path('checkout/xendit/', views.create_xendit_checkout, name='create-xendit-checkout'),
    path('xendit/webhook/', views.xendit_invoice_webhook, name='xendit-invoice-webhook'),
]
