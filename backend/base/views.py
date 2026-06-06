from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CartUser, Product
from .serializers import CartUserSerializer, ProductSerializer, UserSerializer, RegisterSerializer
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
