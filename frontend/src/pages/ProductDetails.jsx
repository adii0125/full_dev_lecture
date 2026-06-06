import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest, getImageUrl, getToken } from '../base_api/api';
import Footer from '../components/Footer';
import Header from '../components/Header';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState('Loading product...');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    apiRequest(`/products/${id}/`, { auth: false })
      .then((data) => {
        setProduct(data);
        setMessage('');
      })
      .catch(() => {
        setMessage('Product not found');
      });
  }, [id]);

  async function handleAddToCart() {
    if (!getToken()) {
      navigate('/login');
      return;
    }

    setMessage('Adding to cart...');

    try {
      await apiRequest('/cart/add/', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, qty }),
      });
      setMessage(`${product.product_name} was added to your account cart.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-5 py-20">
          <div className="mx-auto max-w-[760px] text-center">
            <h1 className="text-4xl font-extrabold text-slate-950">{message}</h1>
            <p className="mt-4 leading-8 text-slate-600">The product you are looking for is not available yet.</p>
            <Link
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-bold text-white no-underline"
              to="/products"
            >
              Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-5 py-14">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-2 lg:items-start">
          <img
            className="aspect-[4/3] w-full rounded-[20px] object-cover shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
            src={getImageUrl(product.image)}
            alt={product.product_name}
          />
          <section>
            <Link className="text-sm font-bold text-teal-700 no-underline hover:text-teal-800" to="/products">
              Back to products
            </Link>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950">{product.product_name}</h1>
            <p className="mt-4 text-2xl font-extrabold text-teal-700">PHP {product.product_price}</p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{product.description}</p>
            {message && (
              <p className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-3 font-semibold text-teal-800">
                {message}
              </p>
            )}
            <label className="mt-6 grid max-w-[140px] gap-2 text-sm font-bold text-slate-800">
              Quantity
              <input
                className="min-h-11 rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-slate-400"
                type="number"
                min="1"
                value={qty}
                onChange={(event) => setQty(Math.max(Number(event.target.value), 1))}
              />
            </label>
            <button
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-bold text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-px hover:bg-slate-800"
              type="button"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProductDetails;
