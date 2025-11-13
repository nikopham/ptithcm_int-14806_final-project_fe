import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-banner.png"; // đặt ảnh lớn vào đây

/**
 * Full-width hero section với 1 ảnh nền duy nhất.
 * Ảnh nên có tỷ lệ ~16:9, kích thước >= 1920×1080 để nét trên desktop.
 */
export const HeroBanner = () => (
  <section
    className="relative isolate min-h-[640px] w-full bg-black"
    style={{
      backgroundImage: `url(${heroImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    {/* overlay làm tối */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/70 to-black" />

    {/* nội dung trung tâm */}
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center">
      <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl">
        The Best Streaming Experience
      </h1>

      <p className="mb-10 text-base leading-relaxed text-zinc-300 md:text-lg">
        StreamVibe is the best streaming experience for watching your favorite
        movies and shows on demand, anytime, anywhere. Enjoy blockbuster hits,
        classics, trending TV shows and more. Create your own watchlists so you
        can easily find the content you want to watch.
      </p>

      <Link
        to="/movies"
        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Play className="size-4 -translate-x-0.5" />
        Start Watching Now
      </Link>
    </div>
  </section>
);
