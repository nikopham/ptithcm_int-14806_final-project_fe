import { MovieShowcase } from "@/components/movies/MovieShowcase";
import { MovieHeroCarousel } from "@/components/movies/MovieHeroCarousel";
import { SerieShowcase } from "@/components/movies/SerieShowcase";
import { CtaTrialBanner } from "@/components/home/CtaTrialBanner";

export default function MoviesPage() {
  return (
    <>
      <MovieHeroCarousel />
      <MovieShowcase />
      <SerieShowcase />
      <CtaTrialBanner />
      {/* …danh sách phim, filter, v.v… */}
    </>
  );
}
