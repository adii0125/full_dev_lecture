import base64
import json
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CartUser, Product, orderItem, paymentMethod
from .serializers import (
    CartUserSerializer,
    ProductSerializer,
    RegisterSerializer,
    UserSerializer,
    XenditCheckoutSerializer,
    XenditInvoiceSerializer,
)
from rest_framework.response import Response


@api_view(['GET'])
def user_profile(request):
    if not request.user.is_authenticated:
        return Response(
            {'detail': 'Authentication credentials were not provided.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            'username': user.username,
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  




def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def parse_qty(value):
    try:
        qty = int(value)
    except (TypeError, ValueError):
        return None

    if qty < 1:
        return None

    return qty


def make_xendit_invoice(payload):
    if not settings.XENDIT_SECRET_KEY:
        raise RuntimeError('XENDIT_SECRET_KEY is not configured.')

    auth_token = base64.b64encode(f'{settings.XENDIT_SECRET_KEY}:'.encode()).decode()
    request = Request(
        'https://api.xendit.co/v2/invoices',
        data=json.dumps(payload).encode(),
        headers={
            'Authorization': f'Basic {auth_token}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode())
    except HTTPError as error:
        error_body = error.read().decode()
        raise RuntimeError(error_body or 'Xendit rejected the invoice request.') from error
    except URLError as error:
        raise RuntimeError('Could not connect to Xendit.') from error


def selected_payment_methods(payment_method):
    if payment_method == 'card':
        return ['CREDIT_CARD']

    return ['GCASH']


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email', '')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'detail': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'detail': 'Username already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, email=email, password=password)
    tokens = get_tokens_for_user(user)
    return Response({
        **tokens,
        'username': user.username,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'detail': 'Invalid username or password.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    tokens = get_tokens_for_user(user)
    return Response({
        **tokens,
        'username': user.username,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_by_id(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ProductSerializer(product)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    qty = parse_qty(request.data.get('qty', 1))
    if qty is None:
        return Response(
            {'error': 'Quantity must be at least 1'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product = Product.objects.get(id=product_id)
    except (Product.DoesNotExist, TypeError, ValueError):
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart_item, created = CartUser.objects.get_or_create(
        user=request.user,
        product=product,
    )

    if created:
        cart_item.qty = qty
    else:
        cart_item.qty += qty

    cart_item.save()
    serializer = CartUserSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, pk):
    qty = parse_qty(request.data.get('qty'))
    if qty is None:
        return Response(
            {'error': 'Quantity must be at least 1'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        cart_item = CartUser.objects.get(id=pk, user=request.user)
    except CartUser.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart_item.qty = qty
    cart_item.save()
    serializer = CartUserSerializer(cart_item)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def read_cart(request):
    cart_items = CartUser.objects.filter(user=request.user)
    serializer = CartUserSerializer(cart_items, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, pk):
    try:
        cart_item = CartUser.objects.get(id=pk, user=request.user)
    except CartUser.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart_item.delete()
    return Response(
        {'message': 'Product removed from cart'},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_xendit_checkout(request):
    serializer = XenditCheckoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    cart_items = CartUser.objects.filter(user=request.user).select_related('product')
    cart_item_ids = serializer.validated_data.get('cart_item_ids')
    if cart_item_ids:
        cart_items = cart_items.filter(id__in=cart_item_ids)

    cart_items = list(cart_items)
    if not cart_items:
        return Response(
            {'detail': 'Select at least one cart item to checkout.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    total = sum(
        Decimal(item.product.product_price) * Decimal(item.qty)
        for item in cart_items
    )
    if total <= 0:
        return Response(
            {'detail': 'Checkout total must be greater than zero.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        payment = paymentMethod.objects.create(
            user=request.user,
            totalPrice=total,
            xendit_status='CREATING',
        )
        payment.xendit_external_id = f'checkout-{payment.id}-{request.user.id}'
        payment.save(update_fields=['xendit_external_id'])

        for cart_item in cart_items:
            orderItem.objects.create(
                product=cart_item.product,
                payment=payment,
                qty=cart_item.qty,
                price=cart_item.product.product_price,
            )

    items = [
        {
            'name': cart_item.product.product_name,
            'quantity': cart_item.qty,
            'price': float(cart_item.product.product_price),
            'category': cart_item.product.brand,
        }
        for cart_item in cart_items
    ]
    frontend_url = settings.FRONTEND_URL.rstrip('/')
    xendit_payload = {
        'external_id': payment.xendit_external_id,
        'amount': float(total),
        'description': f'Checkout #{payment.id}',
        'currency': 'PHP',
        'items': items,
        'payment_methods': selected_payment_methods(serializer.validated_data['payment_method']),
        'success_redirect_url': f'{frontend_url}/?payment=success',
        'failure_redirect_url': f'{frontend_url}/checkout?payment=failed',
        'metadata': {
            'payment_id': payment.id,
            'user_id': request.user.id,
        },
    }

    try:
        invoice = make_xendit_invoice(xendit_payload)
    except RuntimeError as error:
        payment.xendit_status = 'FAILED'
        payment.save(update_fields=['xendit_status'])
        return Response({'detail': str(error)}, status=status.HTTP_502_BAD_GATEWAY)

    payment.xendit_invoice_id = invoice.get('id', '')
    payment.xendit_status = invoice.get('status', 'PENDING')
    payment.save(update_fields=['xendit_invoice_id', 'xendit_status'])

    response_serializer = XenditInvoiceSerializer({
        'id': payment.id,
        'totalPrice': payment.totalPrice,
        'isPaid': payment.isPaid,
        'paidAt': payment.paidAt,
        'xendit_invoice_id': payment.xendit_invoice_id,
        'xendit_external_id': payment.xendit_external_id,
        'xendit_status': payment.xendit_status,
        'invoice_url': invoice.get('invoice_url'),
    })
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def xendit_invoice_webhook(request):
    expected_token = settings.XENDIT_CALLBACK_TOKEN
    callback_token = request.headers.get('x-callback-token')
    if expected_token and callback_token != expected_token:
        return Response({'detail': 'Invalid callback token.'}, status=status.HTTP_403_FORBIDDEN)

    external_id = request.data.get('external_id')
    invoice_id = request.data.get('id')
    invoice_status = request.data.get('status', '')
    normalized_status = invoice_status.upper()

    try:
        payment = paymentMethod.objects.get(xendit_external_id=external_id)
    except paymentMethod.DoesNotExist:
        return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

    payment.xendit_invoice_id = invoice_id or payment.xendit_invoice_id
    payment.xendit_status = normalized_status or payment.xendit_status
    if normalized_status in ['PAID', 'SETTLED', 'SUCCEEDED', 'SUCCESS', 'COMPLETED']:
        payment.mark_paid()
    else:
        payment.save(update_fields=['xendit_invoice_id', 'xendit_status'])

    return Response({'detail': 'Webhook processed.'})
