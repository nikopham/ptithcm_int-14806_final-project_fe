import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieDetailInfo } from "@/components/movies/MovieDetailInfo";
import { seasonsMock } from "@/mocks/seasonsMock";

export default function MovieDetailPage() {
  const movie = {
    id: "kantara",
    title: "Kantara",
    overview:
      "A fiery young man clashes with an unflinching forest officer in a south Indian village where spirituality, fate and folklore rule the lands.",
    backdrops: [
      "https://image.tmdb.org/t/p/original/124xV60NItfAneu7pxRiz8zTPkO.jpg",
      "https://image.tmdb.org/t/p/original/k3ZJt7U9Cb5w56XU4cWpHzRIIvU.jpg",
    ],
  };

  return (
    <>
      <MovieDetailHero {...movie} />
      <MovieDetailInfo type="tv" seasons={seasonsMock} />
      {/* ...cast, similar titles, reviews... */}
    </>
  );
}
