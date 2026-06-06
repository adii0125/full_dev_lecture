from rest_framework import serializers
from .models import CartUser, Product
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class CartUserSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartUser
        fields = [
            'id',
            'product',
            'product_id',
            'qty',
        ]


class XenditCheckoutSerializer(serializers.Serializer):
    cart_item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        required=False,
    )
    payment_method = serializers.ChoiceField(
        choices=['gcash', 'card'],
        required=False,
        default='gcash',
    )


class XenditInvoiceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    totalPrice = serializers.DecimalField(max_digits=10, decimal_places=2)
    isPaid = serializers.BooleanField()
    paidAt = serializers.DateTimeField(allow_null=True)
    xendit_invoice_id = serializers.CharField(allow_blank=True)
    xendit_external_id = serializers.CharField()
    xendit_status = serializers.CharField()
    invoice_url = serializers.URLField()
