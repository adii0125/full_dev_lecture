import { Link } from 'react-router-dom';
import { getToken } from '../base_api/api';
import heroImage from '../assets/uniformsbdu.jpg';

function Hero() {
  const isLoggedIn = Boolean(getToken());

  return (
    <section className="bg-white px-5 py-14 text-slate-950 sm:py-20">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-teal-600">PN Uniform Store</p>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Philippine Navy Uniforms to Lead and Defend our 7,641 Islands.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Browse a small curated shop, compare essentials, and open product details before you buy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-bold text-white no-underline shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-px hover:bg-slate-800"
              to="/products"
            >
              Browse Products
            </Link>
            {!isLoggedIn && (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-800 no-underline transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50"
                to="/register"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] bg-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
          <img className="aspect-[4/3] h-full w-full object-cover" src={heroImage} alt="Featured shop products" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
