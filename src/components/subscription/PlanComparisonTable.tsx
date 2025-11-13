export const PlanComparisonTable = () => (
  <section className="mx-auto max-w-7xl px-4 pb-24">
    {/* heading */}
    <h2 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">
      Compare our plans and find the right one for you
    </h2>
    <p className="mb-10 max-w-2xl text-sm leading-relaxed text-zinc-400">
      StreamVibe offers three different plans to fit your needs: Basic,
      Standard, and Premium. Compare the features of each plan and choose the
      one that’s right for you.
    </p>

    {/* comparison table */}
    <div className="overflow-x-auto rounded-lg bg-zinc-900">
      <table className="min-w-full text-left text-sm text-zinc-300">
        <thead>
          <tr className="border-b border-zinc-700 text-white">
            <th className="w-48 px-6 py-4 font-semibold">Features</th>
            <th className="px-6 py-4 font-semibold">Basic</th>
            <th className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                Standard
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase leading-none text-white">
                  Popular
                </span>
              </div>
            </th>
            <th className="px-6 py-4 font-semibold">Premium</th>
          </tr>
        </thead>

        <tbody>
          {[
            ["Price", "$9.99/Month", "$12.99/Month", "$14.99/Month"],
            [
              "Content",
              "Access to a wide selection of movies and shows, including some new releases.",
              "Access to a wider selection of movies and shows, including most new releases and exclusive content",
              "Access to a widest selection of movies and shows, including all new releases and Offline Viewing",
            ],
            [
              "Devices",
              "Watch on one device simultaneously",
              "Watch on two device simultaneously",
              "Watch on four device simultaneously",
            ],
            ["Free Trial", "7 Days", "7 Days", "7 Days"],
            ["Cancel Anytime", "Yes", "Yes", "Yes"],
            ["HDR", "No", "Yes", "Yes"],
            ["Dolby Atmos", "No", "Yes", "Yes"],
            ["Ad-Free", "No", "Yes", "Yes"],
            [
              "Offline Viewing",
              "No",
              "Yes, for select titles.",
              "Yes, for all titles.",
            ],
            [
              "Family Sharing",
              "No",
              "Yes, up to 5 family members.",
              "Yes, up to 6 family members.",
            ],
          ].map((row, rIdx) => (
            <tr
              key={row[0]}
              className={rIdx % 2 ? "bg-zinc-800/40" : undefined}
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="whitespace-pre-line px-6 py-4 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
