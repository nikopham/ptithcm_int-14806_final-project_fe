import { useState } from "react";

interface Plan {
  id: string;
  title: string;
  desc: string;
  priceMonthly: number;
  priceYearly: number;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    title: "Basic Plan",
    desc: "Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.",
    priceMonthly: 9.99,
    priceYearly: 99.9,
  },
  {
    id: "standard",
    title: "Standard Plan",
    desc: "Access to a wider selection of movies and shows, including most new releases and exclusive content",
    priceMonthly: 12.99,
    priceYearly: 129.9,
  },
  {
    id: "premium",
    title: "Premium Plan",
    desc: "Access to a widest selection of movies and shows, including all new releases and Offline Viewing",
    priceMonthly: 14.99,
    priceYearly: 149.9,
  },
];

export const PricingSection = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24">
      {/* heading + toggle */}
      <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="mb-3 text-3xl font-extrabold text-white md:text-4xl">
            Choose the plan that’s right for you
          </h2>
          <p className="max-w-2xl text-zinc-400">
            Join StreamVibe and select from our flexible subscription options
            tailored to suit your viewing preferences. Get ready for non-stop
            entertainment!
          </p>
        </div>

    
      </div>

      {/* plans grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="flex h-full flex-col rounded-xl border border-zinc-700/60 bg-zinc-900 p-8 transition hover:-translate-y-1 hover:border-red-600/60"
          >
            {/* phần nội dung tự co giãn */}
            <div className="flex-1">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {plan.title}
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-zinc-400">
                {plan.desc}
              </p>

              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">
                  $
                  {billing === "monthly"
                    ? plan.priceMonthly.toFixed(2)
                    : plan.priceYearly.toFixed(2)}
                </span>
                <span className="text-sm text-zinc-400">
                  /{billing === "monthly" ? "month" : "year"}
                </span>
              </div>
            </div>

            {/* cụm CTA luôn sát đáy */}
            <div className="mt-auto flex gap-4">
              <button className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
                Choose Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
