import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, getImageUrl, getUsername, logout } from '../base_api/api';
import Footer from '../components/Footer';
import Header from '../components/Header';

function getCartItemId(item) {
  return item.cart_id ?? item.id;
}

function Account() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState('Loading cart...');
  const [checkoutMessage, setCheckoutMessage] = useState('');

  useEffect(() => {
    apiRequest('/cart/')
      .then((data) => {
        setCartItems(data);
        setSelectedItems(data.map((item) => getCartItemId(item)));
        setMessage('');
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleSelect(cartId) {
    setSelectedItems((currentItems) => {
      if (currentItems.includes(cartId)) {
        return currentItems.filter((id) => id !== cartId);
      }

      return [...currentItems, cartId];
    });
  }

  async function handleQtyChange(cartId, nextQty) {
    const qty = Math.max(Number(nextQty), 1);

    setCartItems((currentItems) =>
      currentItems.map((item) => (getCartItemId(item) === cartId ? { ...item, qty } : item)),
    );

    try {
      await apiRequest(`/cart/${cartId}/update/`, {
        method: 'POST',
        body: JSON.stringify({ qty }),
      });
      setCheckoutMessage('');
    } catch (error) {
      setCheckoutMessage(error.message);
    }
  }

  async function handleRemove(cartId) {
    try {
      await apiRequest(`/cart/remove/${cartId}/`, {
        method: 'DELETE',
      });
      setCartItems((currentItems) => currentItems.filter((item) => getCartItemId(item) !== cartId));
      setSelectedItems((currentItems) => currentItems.filter((id) => id !== cartId));
      setCheckoutMessage('');
    } catch (error) {
      setCheckoutMessage(error.message);
    }
  }

  const selectedTotal = cartItems
    .filter((item) => selectedItems.includes(getCartItemId(item)))
    .reduce((total, item) => total + Number(item.product.product_price) * item.qty, 0);

  function handleCheckout() {
    if (selectedItems.length === 0) {
      setCheckoutMessage('Select at least one item to checkout.');
      return;
    }

    const checkoutItems = cartItems.filter((item) => selectedItems.includes(getCartItemId(item)));
    navigate('/checkout', {
      state: {
        items: checkoutItems,
        total: selectedTotal,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-5 py-14">
        <section className="mx-auto max-w-[900px]">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Account</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-950">
                {getUsername() ? `${getUsername()}'s Cart` : 'Your Cart'}
              </h1>
            </div>
            {getUsername() && (
              <button className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white" type="button" onClick={handleLogout}>
                Log Out
              </button>
            )}
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
              <p>{message}</p>
              <Link className="mt-4 inline-flex font-bold text-teal-700 no-underline" to="/login">
                Go to login
              </Link>
            </div>
          )}

          {!message && cartItems.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
              Your cart is empty.
            </div>
          )}

          <div className="grid gap-4">
            {cartItems.map((item) => {
              const cartItemId = getCartItemId(item);

              return (
                <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[auto_120px_1fr_auto] sm:items-center" key={cartItemId}>
                  <input
                    className="size-5"
                    type="checkbox"
                    checked={selectedItems.includes(cartItemId)}
                    onChange={() => handleSelect(cartItemId)}
                    aria-label={`Select ${item.product.product_name}`}
                  />
                  <img className="aspect-[4/3] w-full rounded-lg object-cover sm:w-[120px]" src={getImageUrl(item.product.image)} alt={item.product.product_name} />
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-950">{item.product.product_name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{item.product.description}</p>
                    <label className="mt-3 grid max-w-[130px] gap-2 text-sm font-bold text-slate-800">
                      Qty
                      <input
                        className="min-h-10 rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-slate-400"
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(event) => handleQtyChange(cartItemId, event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-extrabold text-slate-950">PHP {item.product.product_price}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                      Subtotal: PHP {(Number(item.product.product_price) * item.qty).toFixed(2)}
                    </p>
                    <button
                      className="mt-4 min-h-10 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                      type="button"
                      onClick={() => handleRemove(cartItemId)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {!message && cartItems.length > 0 && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Selected Total</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">PHP {selectedTotal.toFixed(2)}</p>
                </div>
                <button
                  className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white"
                  type="button"
                  onClick={handleCheckout}
                >
                  Continue to Checkout
                </button>
              </div>
              {checkoutMessage && <p className="mt-4 font-semibold text-slate-600">{checkoutMessage}</p>}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Account;
