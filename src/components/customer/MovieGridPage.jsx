// src/pages/MovieGridPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { filterMoviesList, searchMoviesList } from "@/services/movieService"; // (Dịch vụ RTK của bạn)
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MovieItem } from "./MovieItem";
import { PaginationControl } from "./PaginationControl";
import Header from "./Header";
import { Loader2, SlidersHorizontal } from "lucide-react"; // Thêm icon
import { Button } from "@/components/ui/button";
import { MovieFilters } from "./MovieFIlters";
import {
  FILTERS_KEY,
  getParamsFromStorage,
  setParamsInStorage,
} from "@/utils/filterUtils";
import Footer from "./Footer";

export const MovieGridPage = () => {
  const dispatch = useDispatch();

  // 1. Lấy state từ Redux
  const {
    list: movies,
    pagination,
    loading,
    error,
  } = useSelector((state) => state.movie);
  const [params, setParams] = useState(getParamsFromStorage());
  const { isAuthenticated, user } = useSelector((state) => state.auth);
 
  // 2. Lấy params từ URL
  const { id: genreOrCountryId } = useParams();

  useEffect(() => {
    try {
      const accountId = user ? user.id : null;
      filterMoviesList(dispatch, { ...params, page: params.page || 1 }, accountId);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, params, user]);

  // --- THÊM MỚI: useEffect 2 ---
  // Lắng nghe sự kiện từ Header (khi filter thay đổi)
  useEffect(() => {
    // Hàm này sẽ chạy khi Header phát sự kiện
    const handleStorageChange = () => {
      console.log("Storage changed (event from Header), refetching params...");
      // Đọc lại localStorage và cập nhật state
      setParams(getParamsFromStorage());
      // Cập nhật state này sẽ tự động kích hoạt useEffect 1 (gọi API)
    };

    // Đăng ký lắng nghe
    window.addEventListener("storageFilterChanged", handleStorageChange);

    // Dọn dẹp khi component unmount
    return () => {
      window.removeEventListener("storageFilterChanged", handleStorageChange);
    };
  }, []);



  const handlePageChange = (newPage) => {
    const newParams = { ...params, page: newPage };
    setParamsInStorage(newParams); // Lưu vào storage
    setParams(newParams); // Cập nhật state (trigger useEffect)
  };
  // 5. Xử lý khi nhấn "Lọc kết quả"
  const handleApplyFilters = (newFilters) => {
    // newFilters là { type, genre_id, ... }
    const newParams = { ...newFilters, page: 1 }; // Reset về trang 1
    setParamsInStorage(newParams);
    setParams(newParams);
  };
  const handleResetFilters = () => {
    const newParams = { page: 1 }; // Chỉ giữ lại trang 1
    setParamsInStorage(newParams);
    setParams(newParams);
  };
  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <MovieFilters
          currentFilters={params}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          loading={loading}
        />
        {/* (Bạn có thể thêm Tiêu đề trang ở đây) */}
        {/* <h1 className="text-3xl font-bold text-white mb-6">Phim Lẻ</h1> */}

        {/* Hiển thị loading hoặc lỗi */}
        {loading && (
          <div className="flex justify-center items-center min-h-60">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        )}

        {/* Hiển thị Grid */}
        {!loading && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {movies.map((movie) => (
                <MovieItem key={movie.id} movie={movie} isLiked={movie?.isLiked}/>
              ))}
            </div>

            {/* Phân trang */}
            <div className="mt-12">
              <PaginationControl
                currentPage={pagination?.page || 1}
                totalPages={pagination?.totalPages || 1}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          </>
        )}

        {/* Không có kết quả */}
        {!loading && movies.length === 0 && !error && (
          <div className="text-center text-muted-foreground min-h-60">
            <p>Không tìm thấy phim nào phù hợp.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};
