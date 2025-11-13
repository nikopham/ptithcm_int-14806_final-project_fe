import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  const year = new Date().getFullYear();

  const colCls = "space-y-2 text-sm leading-6";
  const headCls = "mb-4 text-base font-semibold text-white";
  const linkCls = "block transition-colors duration-200 hover:text-white";

  return (
    <footer className="mt-20 bg-[#0b0b0b] px-4 text-zinc-400">
      {/* top columns ---------------------------------------------------- */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 gap-x-8 py-14 md:grid-cols-6">
        {/* Home */}
        <div className={colCls}>
          <h6 className={headCls}>Home</h6>
          <Link to="/categories" className={linkCls}>
            Categories
          </Link>
          <Link to="/devices" className={linkCls}>
            Devices
          </Link>
          <Link to="/pricing" className={linkCls}>
            Pricing
          </Link>
          <Link to="/faq" className={linkCls}>
            FAQ
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Movies</h6>
          <Link to="/movies/genres" className={linkCls}>
            Genres
          </Link>
          <Link to="/movies/trending" className={linkCls}>
            Trending
          </Link>
          <Link to="/movies/new" className={linkCls}>
            New Release
          </Link>
          <Link to="/movies/popular" className={linkCls}>
            Popular
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Shows</h6>
          <Link to="/shows/genres" className={linkCls}>
            Genres
          </Link>
          <Link to="/shows/trending" className={linkCls}>
            Trending
          </Link>
          <Link to="/shows/new" className={linkCls}>
            New Release
          </Link>
          <Link to="/shows/popular" className={linkCls}>
            Popular
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Support</h6>
          <Link to="/contact" className={linkCls}>
            Contact Us
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Subscription</h6>
          <Link to="/plans" className={linkCls}>
            Plans
          </Link>
          <Link to="/features" className={linkCls}>
            Features
          </Link>
        </div>

        {/* Connect */}
        <div className={colCls}>
          <h6 className={headCls}>Connect With Us</h6>
          <div className="flex gap-3 pt-1">
            {[Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-md bg-zinc-800 text-zinc-200 transition hover:bg-red-600 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* divider line --------------------------------------------------- */}
      <div className="mx-auto h-px max-w-7xl bg-zinc-700/60" />

      {/* bottom bar ----------------------------------------------------- */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 py-6 text-xs md:flex-row">
        <p>©{year} streamvib, All Rights Reserved</p>

        <nav className="flex flex-wrap items-center gap-4 text-zinc-300">
          <Link to="/terms" className={linkCls}>
            Terms of Use
          </Link>
          <span className="hidden select-none text-zinc-600 md:inline">│</span>
          <Link to="/privacy" className={linkCls}>
            Privacy Policy
          </Link>
          <span className="hidden select-none text-zinc-600 md:inline">│</span>
          <Link to="/cookies" className={linkCls}>
            Cookie Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
};
