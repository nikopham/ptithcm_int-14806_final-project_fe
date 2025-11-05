import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import axios from "../services/axiosInstance";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/customer/HeroSection";
import Footer from "@/components/customer/Footer";
import Header from "@/components/customer/Header";
import { MovieSlider } from "@/components/customer/MovieSlider";
import { MovieCategoryList } from "@/components/customer/MovieCategoryList";
import { ActorList } from "@/components/customer/ActorList";
import {
  getCountry,
  getGenres,
  getMovieByCategories,
  getNewFeedMovie,
  getTopActors,
} from "@/services/movieService";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// 1. Dữ liệu phim mẫu (Đã cập nhật)
const MOCK_MOVIES = [
  {
    id: 1,
    title: "Chó cưng đừng sợ",
    subtitle: "Good boy",
    description:
      "Phim kể về chú chó Indy, chuyên đến sống cùng chủ nhân Todd ở một ngôi nhà rừng thẳm...",
    imdb: 6.2,

    likes: 716,

    duration: "1h 17m",
    genres: ["Chiến Rạp", "Quỷ Dị", "Tâm lý", "Kỳ Ảo"],
    bgImageUrl:
      "https://vcdn1-giaitri.vnecdn.net/2015/12/16/forceawakensbanner-1450231903.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=H3Yftz8g3dTU3wGfXCUT7g", // URL ảnh "Chó cưng"
  },
  {
    id: 2,
    title: "Mission: Impossible",
    subtitle: "Dead Reckoning",
    description:
      "Ethan Hunt and his IMF team embark on their most dangerous mission yet...",
    imdb: 7.7,

    likes: 982,

    duration: "2h 43m",
    genres: ["Hành động", "Phiêu lưu", "Giật gân"],
    bgImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/2560px-Star_Wars_Logo.svg.png", // URL ảnh "MI"
  },
  {
    id: 3,
    title: "Oppenheimer",
    subtitle: "",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development...",
    imdb: 8.4,

    likes: 1300,

    duration: "3h 0m",
    genres: ["Tiểu sử", "Drama", "Lịch sử"],
    bgImageUrl:
      "https://vcdn1-giaitri.vnecdn.net/2015/12/16/forceawakensbanner-1450231903.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=H3Yftz8g3dTU3wGfXCUT7g", // URL ảnh "Oppenheimer"
  },
];
const MOCK_CATEGORIES = [
  {
    category: "Comedy Movies",
    movies: [
      {
        id: 1,
        title: "The Dictator",
        posterUrl:
          "https://m.media-amazon.com/images/I/71zVjFj7lQL._AC_UF894,1000_QL80_.jpg",
      },
      {
        id: 2,
        title: "Anyone but You",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BYTNhYWM5NGUtMzYwMS00ZDFiLWFjMTItYTk5ZDE4YTA0Y2FmXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_.jpg",
      },
      {
        id: 3,
        title: "Focus",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BMTM4NTEzNTYwMV5BMl5BanBnXkFtZTgwMjc4Nzk5NTE@._V1_FMjpg_UX1000_.jpg",
      },
      {
        id: 4,
        title: "Argylle",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BZDM3MThhZDYtMzYyMy00ZGNmLWIzZDMtMGRkONY4M2E1ZTUwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
      },
      {
        id: 5,
        title: "Dolittle",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BMDk3ZmYwYjEtZDYxYi00MmQyLWFjYjktYWNkM2Y3YTY3MTEyXkEyXkFqcGdeQXVyMTA3MDk2NDg2._V1_.jpg",
      },
      {
        id: 6,
        title: "Beverly Hills Cop: Axel F",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BYzJkYmFkYjYtYWIyNi00YmY5LThlYmYtYTkxYjM5MTE0ZTFkXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_.jpg",
      },
    ],
  },
  {
    category: "Action Movies",
    movies: [
      {
        id: 8,
        title: "Mad Max: Fury Road",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BZWZlODNlYWUtZjY1NS00Y2ZkLTk4ZGMtYzU5YjcxYjkzYmQ2XkEyXkFqcGdeQXVyMjMwNDgzNjc@._V1_FMjpg_UX1000_.jpg",
      },
      {
        id: 9,
        title: "John Wick",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_.jpg",
      },
      {
        id: 10,
        title: "The Dark Knight",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
      },
      {
        id: 11,
        title: "Inception",
        posterUrl:
          "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
      },
    ],
  },
  // Thêm các thể loại khác ở đây...
];
const MOCK_ACTORS = [
  {
    id: 1,
    name: "Jason Momoa",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BNTA0MDc1MzA0NV5BMl5BanBnXkFtZTcwMTU1MTA4Mw@@._V1_UY317_CR1_0,0,214,317_AL_.jpg",
  },
  {
    id: 2,
    name: "Dwayne Johnson",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BMTkyNDQ3NzAxM15BMl5BanBnXkFtZTgwODIwMTQ0NTE@._V1_UY317_CR1_0,0,214,317_AL_.jpg",
  },
  {
    id: 3,
    name: "Emma Watson",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BMTQ3NzA1ODMyMV5BMl5BanBnXkFtZTgwNTAwMDI3MjE@._V1_UY317_CR1_0,0,214,317_AL_.jpg",
  },
  {
    id: 4,
    name: "Tom Holland",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BNzZiNTEyNTItYjNhMS00YjI2LWIwMWQtZmYwYTRlNjMyZTJjXkEyXkFqcGdeQXVyMTExNzQzMDE0._V1_UY317_CR2_0,0,214,317_AL_.jpg",
  },
  {
    id: 5,
    name: "Ana de Armas",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BMjA3NjYzMzE1MV5BMl5BanBnXkFtZTgwNTA4NDY4OTE@._V1_UY317_CR1_0,0,214,317_AL_.jpg",
  },
  {
    id: 6,
    name: "Keanu Reeves",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BNmatrixmatrixmNQ@._V1_UY317_CR2_0,0,214,317_AL_.jpg",
  },
  {
    id: 7,
    name: "Dakota Johnson",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BMTY3MjM0ODMyOV5BMl5BanBnXkFtZTgwNjAyNzU2MTE@._V1_UY317_CR12_0,0,214,317_AL_.jpg",
  },
];
const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newFeedList, categoriesMovie, topActors, loading } = useSelector(
    (state) => state.movie
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  useEffect(() => {
    const accountId = user ? user.id : null;
    getNewFeedMovie(dispatch, accountId);
    getMovieByCategories(dispatch, accountId);
    getTopActors(dispatch);
  }, [dispatch, user]);
  let categoryData = categoriesMovie || MOCK_CATEGORIES;

  return (
    <div>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <Header />
      <MovieSlider movies={newFeedList || MOCK_MOVIES} />
      <div className="container mx-auto">
        {categoryData.map((categoryData) => (
          <MovieCategoryList
            key={categoryData.category}
            title={categoryData.category}
            movies={categoryData.movies}
          />
        ))}
      </div>
      <div className="container mx-auto">
        <ActorList title="Diễn viên" actors={topActors || MOCK_ACTORS} />
      </div>
      {/* <HeroSection /> */}

      <div className="mt-32">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
