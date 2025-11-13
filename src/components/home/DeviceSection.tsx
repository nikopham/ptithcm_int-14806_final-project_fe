import { Smartphone, Tablet, Tv2, Laptop, Gamepad2 } from "lucide-react";

/** Card props */
interface DeviceCardProps {
  Icon: React.ElementType;
  title: string;
  desc: string;
}

const DeviceCard = ({ Icon, title, desc }: DeviceCardProps) => (
  <div className="group relative overflow-hidden rounded-xl bg-zinc-900 p-8 shadow-lg transition hover:-translate-y-1">
    {/* subtle radial red glow */}
    <div
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background:
          "radial-gradient(1000px at 90% 10%, rgba(239,68,68,0.15), transparent 70%)",
      }}
    />
    {/* icon */}
    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-800">
      <Icon className="size-7 text-red-600" />
    </div>

    <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>
  </div>
);

export const DeviceSection = () => {
  const desc =
    "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store";

  const data = [
    { Icon: Smartphone, title: "Smartphones" },
    { Icon: Tablet, title: "Tablet" },
    { Icon: Tv2, title: "Smart TV" },
    { Icon: Laptop, title: "Laptops" },
    { Icon: Gamepad2, title: "Gaming Consoles" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24">
      {/* heading */}
      <div className="mb-14 max-w-3xl">
        <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
          We provide you streaming experience across various devices.
        </h2>
        <p className="text-zinc-400">
          With StreamVibe, you can enjoy your favorite movies and TV shows
          anytime, anywhere. Our platform is designed to be compatible with a
          wide range of devices, ensuring that you never miss a moment of
          entertainment.
        </p>
      </div>

      {/* grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <DeviceCard key={item.title} {...item} desc={desc} />
        ))}
      </div>
    </section>
  );
};
