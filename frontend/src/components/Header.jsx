import { Link, NavLink } from 'react-router-dom';
import { getUsername } from '../base_api/api';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
];
const buttonClasses =
  'inline-flex min-h-[42px] items-center justify-center rounded-lg border border-transparent px-[18px] text-sm font-bold leading-none no-underline transition duration-150 hover:-translate-y-px focus-visible:-translate-y-px max-[760px]:min-h-[38px] max-[760px]:px-3.5';

function Header({
  brand = 'PN Uniform Store',
  links = navItems,
  primaryAction = 'Shop Now',
  secondaryAction = 'Sign In',
}) {
  const username = getUsername();
  const visibleLinks = username ? [...links, { label: 'Account', to: '/account' }] : links;

  return (
    <header
      className="box-border w-full border-b border-[rgba(229,228,231,0.82)] bg-[rgba(255,255,255,0.92)] px-12 py-[22px] backdrop-blur-2xl dark:border-[rgba(46,48,58,0.9)] dark:bg-[rgba(22,23,29,0.9)] max-[760px]:px-5 max-[760px]:py-[18px]"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-8 max-[760px]:flex-wrap max-[760px]:gap-[18px]">
        <Link
          className="inline-flex items-center gap-3 whitespace-nowrap text-[22px] font-bold leading-none text-[#111015] no-underline dark:text-slate-50 max-[460px]:text-[19px]"
          to="/"
          aria-label={`${brand} home`}
        >
          <span
            className="grid size-[38px] place-items-center rounded-xl bg-[linear-gradient(135deg,#0f172a_0%,#3b82f6_54%,#14b8a6_100%)] text-[17px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] max-[460px]:size-[34px] max-[460px]:rounded-[10px]"
            aria-hidden="true"
          >
            {brand.slice(0, 1)}
          </span>
          <span>{brand}</span>
        </Link>

        <nav
          className="flex items-center justify-center gap-[34px] max-[760px]:order-3 max-[760px]:w-full max-[760px]:justify-start max-[760px]:gap-[18px] max-[760px]:overflow-x-auto max-[760px]:pb-0.5"
          aria-label="Main menu"
        >
          {visibleLinks.map((link) => (
            <NavLink
              className={({ isActive }) =>
                `text-[15px] font-semibold leading-none no-underline transition-colors duration-150 hover:text-[#111015] focus-visible:text-[#111015] dark:hover:text-slate-50 dark:focus-visible:text-slate-50 ${
                  isActive ? 'text-[#111015] dark:text-slate-50' : 'text-[#5e6070] dark:text-[#a9adba]'
                }`
              }
              to={link.to}
              key={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 max-[760px]:ml-auto">
          {username ? (
            <Link
              className={`${buttonClasses} border-[rgba(17,16,21,0.12)] text-[#343541] hover:border-[rgba(17,16,21,0.2)] hover:bg-[#f7f8fb] focus-visible:border-[rgba(17,16,21,0.2)] focus-visible:bg-[#f7f8fb] dark:border-[rgba(243,244,246,0.16)] dark:text-gray-100 dark:hover:border-[rgba(243,244,246,0.26)] dark:hover:bg-white/[0.06] dark:focus-visible:border-[rgba(243,244,246,0.26)] dark:focus-visible:bg-white/[0.06] max-[460px]:hidden`}
              to="/account"
            >
              Account
            </Link>
          ) : (
            <Link
              className={`${buttonClasses} border-[rgba(17,16,21,0.12)] text-[#343541] hover:border-[rgba(17,16,21,0.2)] hover:bg-[#f7f8fb] focus-visible:border-[rgba(17,16,21,0.2)] focus-visible:bg-[#f7f8fb] dark:border-[rgba(243,244,246,0.16)] dark:text-gray-100 dark:hover:border-[rgba(243,244,246,0.26)] dark:hover:bg-white/[0.06] dark:focus-visible:border-[rgba(243,244,246,0.26)] dark:focus-visible:bg-white/[0.06] max-[460px]:hidden`}
              to="/login"
            >
              {secondaryAction}
            </Link>
          )}
          <Link
            className={`${buttonClasses} bg-gray-900 text-white shadow-[0_12px_24px_rgba(17,24,39,0.16)] hover:bg-slate-900 focus-visible:bg-slate-900 dark:bg-slate-50 dark:text-[#101116]`}
            to="/products"
          >
            {primaryAction}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
