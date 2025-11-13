import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

interface Faq {
  id: number;
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    id: 1,
    q: "What is StreamVibe?",
    a: "StreamVibe is a streaming service that allows you to watch movies and shows on demand.",
  },
  { id: 2, q: "How much does StreamVibe cost?", a: "" },
  { id: 3, q: "What content is available on StreamVibe?", a: "" },
  { id: 4, q: "How can I watch StreamVibe?", a: "" },
  { id: 5, q: "How do I sign up for StreamVibe?", a: "" },
  { id: 6, q: "What is the StreamVibe free trial?", a: "" },
  { id: 7, q: "How do I contact StreamVibe customer support?", a: "" },
  { id: 8, q: "What are the StreamVibe payment methods?", a: "" },
];

export const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(1);

  const toggle = (id: number) => {
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24">
      {/* heading row */}
      <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="mb-3 text-3xl font-extrabold text-white md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="max-w-2xl text-zinc-400">
            Got questions? We've got answers! Check out our FAQ section to find
            answers to the most common questions about StreamVibe.
          </p>
        </div>

        <Link
          to="/contact"
          className="inline-flex h-11 items-center rounded-md bg-red-600 px-6 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Ask a Question
        </Link>
      </div>

      {/* faq grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {FAQS.map((item) => {
          const isOpen = open === item.id;
          return (
            <div
              key={item.id}
              className={clsx(
                "border-b border-zinc-700/40 pb-6",
                isOpen && "border-red-600/60"
              )}
            >
              <button
                onClick={() => toggle(item.id)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                {/* number badge */}
                <div className="flex-shrink-0">
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-zinc-800">
                    <span className="font-medium text-white">
                      {item.id.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* question + answer */}
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {item.q}
                  </h3>
                  {isOpen && item.a && (
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {item.a}
                    </p>
                  )}
                </div>

                {/* icon */}
                {isOpen ? (
                  <Minus className="mt-1 size-4 flex-shrink-0 text-white" />
                ) : (
                  <Plus className="mt-1 size-4 flex-shrink-0 text-white" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
