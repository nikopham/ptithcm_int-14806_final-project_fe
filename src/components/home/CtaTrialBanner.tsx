import heroImg from "@/assets/hero-banner.png";
import { Link } from "react-router-dom";

export const CtaTrialBanner = () => (
  <section className="mx-auto max-w-7xl px-4 pb-8 pt-8">
    <div
      className="relative flex h-60 flex-col items-center justify-between gap-6 overflow-hidden rounded-xl p-10 sm:h-56 sm:flex-row"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay: tối + pha đỏ */}
      <div className="absolute inset-0 -z-10 bg-black/60" />
      <div className="absolute inset-0 -z-10 bg-red-700/40 mix-blend-multiply" />

      {/* nội dung */}
      <h2 className="max-w-xl text-center text-3xl font-extrabold text-white sm:text-left md:text-4xl">
        Start your free trial today!
      </h2>

      {/* CTA */}
      <Link
        to="/register"
        className="inline-flex h-12 items-center rounded-md bg-red-600 px-8 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Start a Free Trial
      </Link>
    </div>
  </section>
);
