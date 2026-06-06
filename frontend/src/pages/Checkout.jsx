import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../base_api/api';
import Footer from '../components/Footer';
import Header from '../components/Header';

const paymentMethods = [
  { id: 'gcash', label: 'GCash', text: 'Pay through Xendit hosted checkout.' },
  { id: 'card', label: 'Card', text: 'Pay with debit or credit card through Xendit.' },
];

function getCartItemId(item) {
  return item.cart_id ?? item.id;
}

function Checkout() {
  const location = useLocation();
  const items = useMemo(() => location.state?.items || [], [location.state]);
  const total = location.state?.total || 0;
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('Creating secure checkout...');

    try {
      const data = await apiRequest('/checkout/xendit/', {
        method: 'POST',
        body: JSON.stringify({
          payment_method: paymentMethod,
          cart_item_ids: items.map((item) => getCartItemId(item)),
        }),
      });

      window.location.href = data.invoice_url;
    } catch (error) {
      setMessage(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-5 py-14">
        <section className="mx-auto max-w-[760px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Checkout</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950">Select payment method</h1>

          {items.length === 0 ? (
            <div className="mt-8 rounded-lg bg-slate-50 p-5 text-slate-700">
              No checkout items selected. <Link className="font-bold text-teal-700 no-underline" to="/account">Back to cart</Link>
            </div>
          ) : (
            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-4" key={method.id}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    <span>
                      <span className="block font-extrabold text-slate-950">{method.label}</span>
                      <span className="mt-1 block text-sm text-slate-600">{method.text}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="rounded-lg bg-slate-50 p-5">
                <p className="font-bold text-slate-600">Selected items: {items.length}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">PHP {Number(total).toFixed(2)}</p>
              </div>

              <button
                className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Opening Xendit...' : 'Pay with Xendit'}
              </button>
              {message && <p className="font-semibold text-teal-700">{message}</p>}
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Checkout;
