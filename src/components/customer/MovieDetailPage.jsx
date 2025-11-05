// src/pages/MovieDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getPublicMovieDetails,
  getRecommendMovies,
} from "@/services/movieService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaPlay,
  FaHeart,
  FaPlus,
  FaShare,
  FaCommentDots,
} from "react-icons/fa";
import { Loader2, Send } from "lucide-react";
import Footer from "./Footer";
import Header from "./Header";
import { HorizontalMovieList } from "./HorizontalMovieList";

// (Component con giả lập)
const CommentList = ({ comments }) => (
  <div className="space-y-4">
    {comments.map((comment) => (
      <div key={comment.id} className="flex gap-3">
        <Avatar>
          <AvatarImage src={comment.account.avatar_url} />
          <AvatarFallback>{comment.account.full_name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{comment.account.full_name}</p>
          <p className="text-sm text-muted-foreground">{comment.content}</p>
        </div>
      </div>
    ))}
  </div>
);
const ActorList = ({ actors }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {actors.map((actor) => (
      <div key={actor.id} className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={actor.avatar_url} />
          <AvatarFallback>{actor.name[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{actor.name}</span>
      </div>
    ))}
  </div>
);

export const MovieDetailPage = () => {
  const { movieId } = useParams();
  const dispatch = useDispatch();
  const {
    movieInfoDetail: movie,
    loading,
    recommendList: recommendations,
  } = useSelector((state) => state.movie);
  const id = movieId;
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  useEffect(() => {
    const accountId = user ? user.id : null;
    if (id) {
      getRecommendMovies(dispatch, id, accountId);
      getPublicMovieDetails(dispatch, id);
    }
  }, [dispatch, id, user]);

  if (loading || !movie) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Lấy danh sách các mùa (keys của object 'seasons')
  const seasonKeys = Object.keys(movie.seasons);

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* 1. Banner Nền (Background Banner) */}
        <div className="relative w-full h-[60vh]">
          <img
            src={movie.banner_url}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover -z-20"
          />
          {/* Lớp phủ Gradient (Đã sửa) */}
          {/* Gradient cho light theme: 
          'from-background' (ví dụ: white) 
          'via-background/80' (ví dụ: white 80%)
        */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent -z-10" />
        </div>

        {/* 2. Nội dung chính (Main Content) */}
        {/* SỬA: Kéo nội dung lên trên (âm) để đè lên banner
        'pt-[20vh]' được thay bằng 'mt-[-40vh]'
      */}
        <div
          className="container mx-auto px-4 pb-16 
                    relative z-10 -mt-[40vh]"
        >
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-8">
            {/* CỘT TRÁI (POSTER & INFO) */}
            <div className="space-y-4">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
              <div>
                {/* SỬA: Thêm 'text-foreground' cho tiêu đề */}
                <h3 className="font-semibold text-foreground mb-2">
                  Giới thiệu
                </h3>
                {/* 'text-muted-foreground' vẫn ổn trên light theme */}
                <p className="text-sm text-muted-foreground line-clamp-6">
                  {movie.description}
                </p>
              </div>
            </div>

            {/* CỘT PHẢI (ACTIONS, TABS, EPISODES, COMMENTS) */}
            <div className="space-y-6">
              {/* SỬA: Thêm 'text-foreground' cho tiêu đề chính */}
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                {movie.title}
              </h1>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  // SỬA: Đổi màu nút chính (ví dụ: dùng màu 'primary' của shadcn)
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FaPlay className="h-5 w-5 mr-2" />
                  Xem Ngay
                </Button>
                {/* 'variant="outline"' tự động thích ứng với light/dark theme */}
                <Button size="lg" variant="outline" className="gap-2">
                  <FaHeart /> Yêu thích ({movie.likesCount})
                </Button>
                {/* (Các nút khác giữ nguyên) */}
              </div>

              {/* Tabs (Tự động thích ứng) */}
              <Tabs
                defaultValue={movie.type === "tv" ? "episodes" : "actors"}
                className="w-full"
              >
                <TabsList>
                  {movie.type === "tv" && (
                    <TabsTrigger value="episodes">Tập phim</TabsTrigger>
                  )}
                  <TabsTrigger value="actors">Diễn viên</TabsTrigger>
                </TabsList>

                {/* Nội dung TẬP PHIM */}
                {movie.type === "tv" && (
                  <TabsContent value="episodes" className="mt-4">
                    <div className="space-y-4">
                      {/* Lọc Mùa (Phần) */}
                      {seasonKeys.length > 1 && ( // Chỉ hiển thị nếu có nhiều hơn 1 mùa
                        <div className="flex items-center gap-2">
                          {seasonKeys.map((seasonNum) => (
                            <Button key={seasonNum} variant="outline">
                              Phần {seasonNum}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Danh sách tập (ví dụ mùa 1) */}
                      {seasonKeys.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {movie.seasons[seasonKeys[0]].map((ep) => (
                            <Button
                              key={ep.id}
                              variant="outline"
                              className="justify-start"
                            >
                              Tập {ep.episode_number}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Phim này chưa có tập nào.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                )}
                {/* Nội dung DIỄN VIÊN */}
                <TabsContent value="actors" className="mt-4">
                  <ActorList actors={movie.actors} />
                </TabsContent>
              </Tabs>
              <div className="mt-12">
                <HorizontalMovieList
                  title="Hệ thống gợi ý cho bạn"
                  movies={recommendations}
                />
              </div>

              {/* Bình luận */}
              <div className="space-y-4">
                {/* SỬA: Thêm 'text-foreground' */}
                <h3 className="text-xl font-semibold text-foreground">
                  Bình luận ({movie.commentsCount})
                </h3>
                <div className="flex gap-3">
                  {/* (Phần Avatar, Textarea, Button tự động thích ứng) */}
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>Tân</AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="Vui lòng đăng nhập để bình luận..."
                    className="flex-1"
                  />
                  <Button>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <CommentList comments={movie.comments} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
