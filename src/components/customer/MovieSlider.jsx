// src/components/MovieSlider.jsx

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MovieHeroSlide } from "./MovieHeroSlide";

export const MovieSlider = ({ movies }) => {
  const [api, setApi] = React.useState(null);
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    })
  );

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  if (!movies || movies.length === 0) {
    return <div>Không có phim để hiển thị.</div>;
  }

  return (
    <Carousel
      setApi={setApi}
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        loop: true,
      }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.play}
    >
      {/* 1. Thêm 'relative' để các slide chồng lên nhau */}
      <CarouselContent className="relative">
        {movies.map((movie, index) => (
          <CarouselItem
            key={movie.id || index}
            // 2. Class RẤT QUAN TRỌNG:
            // -ml-0 (tắt margin) và basis-full (rộng 100%)
            className="-ml-0 basis-full"
          >
            <MovieHeroSlide
              movie={movie}
              allMovies={movies}
              carouselApi={api}
              currentIndex={current}
              slideIndex={index} // <-- 3. Thêm prop 'slideIndex'
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
