import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8 text-slate-600">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">© 2026 ShopEase. All rights reserved.</p>
        <div className="flex flex-wrap gap-5 text-sm font-semibold">
          <Link className="text-slate-600 no-underline transition hover:text-slate-950" to="/products">
            Products
          </Link>
          <Link className="text-slate-600 no-underline transition hover:text-slate-950" to="/login">
            Login
          </Link>
          <Link className="text-slate-600 no-underline transition hover:text-slate-950" to="/register">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
