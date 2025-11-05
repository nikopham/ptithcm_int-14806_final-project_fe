// src/pages/admin/MovieImportPage.jsx

import React, { useState, useEffect } from "react";
import { toast } from "sonner"; // Đổi sang sonner
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, X, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// (Bạn cần tạo các action này trong slice)
import {
  setError,
  setLoading,
  clearImportFormDetails,
  clearMoviesSearchResult,
} from "@/features/movie/movieSlice";
import {
  searchMovieByKeyword,
  getTmdbDetailsForForm,
  createMovieFromForm,
} from "@/services/movieService";
import { useNavigate } from "react-router-dom";

export const MovieImporter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Lấy state từ Redux store
  const { loading, searchResult, importFormDetails } = useSelector(
    (state) => state.movie
  );

  // State local cho input tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // State local cho form, được đồng bộ từ Redux
  const [form, setForm] = useState(null);

  // Khi Redux có chi tiết form, cập nhật state local
  useEffect(() => {
    setForm(importFormDetails);
  }, [importFormDetails]);

  // --- Handlers (Gọi service) ---

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      await searchMovieByKeyword(dispatch, searchQuery);
    } catch (error) {
      toast.error(error.message || "Lỗi khi tìm kiếm.");
    }
  };

  const handleSelectMovie = async (item) => {
    
    // Xóa kết quả tìm kiếm
    dispatch(clearMoviesSearchResult());
    setSearchQuery(item.title); // Điền tên
    try {
      
      
      // Service này sẽ tự dispatch(setLoading) và setImportFormDetails
      await getTmdbDetailsForForm(dispatch, item.id, item.type);
    } catch (error) {
      toast.error(error.message || "Lỗi khi lấy chi tiết.");
      setSearchQuery(""); // Xóa thanh tìm kiếm nếu lỗi
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await createMovieFromForm(dispatch, form);
      toast.success(res.message || "Tạo phim thành công!");
      resetForm();
      navigate("/admin-dashboard/movie-list"); // Quay về danh sách phim
    } catch (error) {
      console.log(error);
      
      toast.error(error?.response?.data?.message || "Tạo thất bại.");
    }
  };

  // --- Handlers (Quản lý form local) ---
  // Các hàm này giờ sẽ cập nhật state 'form' local
  const setSourceField = (epTmdbId, sourceIndex, field, value) => {
    setForm((f) => ({
      ...f,
      episodes: f.episodes.map((ep) => {
        if (ep.tmdb_id !== epTmdbId) return ep;
        const newSources = ep.videoSources.map((source, idx) => {
          if (idx !== sourceIndex) return source;
          return { ...source, [field]: value };
        });
        return { ...ep, videoSources: newSources };
      }),
    }));
  };

  const addSource = (epTmdbId) => {
    setForm((f) => ({
      ...f,
      episodes: f.episodes.map((ep) => {
        if (ep.tmdb_id !== epTmdbId) return ep;
        const newSources = [
          ...ep.videoSources,
          { video_url: "", quality: "Q720P", label: "720p" },
        ];
        return { ...ep, videoSources: newSources };
      }),
    }));
  };

  const removeSource = (epTmdbId, sourceIndex) => {
    setForm((f) => ({
      ...f,
      episodes: f.episodes.map((ep) => {
        if (ep.tmdb_id !== epTmdbId) return ep;
        const newSources = ep.videoSources.filter(
          (_, idx) => idx !== sourceIndex
        );
        return { ...ep, videoSources: newSources };
      }),
    }));
  };

  const setFormStatus = (status) => {
    setForm((f) => ({ ...f, status: status }));
  };

  const resetForm = () => {
    setForm(null);
    setSearchQuery("");
    dispatch(clearImportFormDetails());
    dispatch(clearMoviesSearchResult());
  };

  return (
    <div className="space-y-6">
      {/* 1. KHU VỰC TÌM KIẾM */}
      <Card>
        <CardHeader>
          <CardTitle>Bước 1: Tìm phim trên TMDb</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Gõ tên phim..."
            />
            <Button
              type="button"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {/* Kết quả tìm kiếm (đọc từ Redux) */}
          {searchResult?.length > 0 && (
            <div className="border rounded-md max-h-64 overflow-y-auto">
              {searchResult.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-2 border-b last:border-b-0 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectMovie(item)}
                >
                  <img
                    src={item.poster || "https://via.placeholder.com/40x60"}
                    alt="poster"
                    className="w-10 rounded"
                  />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type === "movie" ? "Phim lẻ" : "Phim bộ"} •{" "}
                      {item.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
 

      {/* 2. KHU VỰC FORM (HIỆN KHI CÓ DATA) */}
      {loading &&
        !form && ( // Đang loading chi tiết
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Đang tải chi tiết phim...</p>
          </div>
        )}

      {form && ( // Khi form (local) đã có data
        <Card>
          <CardHeader>
            <CardTitle>Bước 2: Thêm nguồn video và xác nhận</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* THÔNG TIN READ-ONLY */}
            <div className="space-y-4">
              <h4 className="font-semibold">Thông tin phim (TMDb)</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <img
                  src={form.poster_url}
                  alt="poster"
                  className="rounded-lg md:col-span-1"
                />
                <div className="space-y-4 md:col-span-3">
                  <Input value={form.title} disabled />
                  <Textarea value={form.description} rows={5} disabled />
                  <div className="flex flex-wrap gap-2">
                    {form.genres.map((g) => (
                      <Badge key={g.tmdb_id} variant="secondary">
                        {g.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.actors.slice(0, 5).map((a) => (
                      <Badge
                        key={a.tmdb_id}
                        variant="outline"
                        className="flex items-center gap-1.5 p-1 pr-2"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={a.avatar_url} />
                          <AvatarFallback>{a.name[0]}</AvatarFallback>
                        </Avatar>
                        {a.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* TRẠNG THÁI (EDITABLE) */}
            <div className="space-y-2 max-w-xs">
              <Label>Trạng thái (*)</Label>
              <Select value={form.status} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Đang chờ (Pending)</SelectItem>
                  <SelectItem value="published">
                    Công khai (Published)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* THÔNG TIN TẬP PHIM (EDITABLE) */}
            <div className="space-y-4">
              <h4 className="font-semibold">
                Danh sách tập ({form.type === "movie" ? "Phim lẻ" : "Phim bộ"})
              </h4>
              <div className="space-y-6">
                {form.episodes.map((ep) => (
                  <Card key={ep.tmdb_id} className="bg-muted/30">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-md">{ep.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ep.videoSources.map((source, sIdx) => (
                        <div
                          key={sIdx}
                          className="grid grid-cols-1 md:grid-cols-10 gap-2 items-end"
                        >
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs">Chất lượng</Label>
                            <Select
                              value={source.quality}
                              onValueChange={(v) =>
                                setSourceField(ep.tmdb_id, sIdx, "quality", v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Q360P">360p</SelectItem>
                                <SelectItem value="Q480P">480p</SelectItem>
                                <SelectItem value="Q720P">720p</SelectItem>
                                <SelectItem value="Q1080P">1080p</SelectItem>
                                <SelectItem value="Q4K">4K</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs">Nhãn</Label>
                            <Input
                              placeholder="720p (Vietsub)"
                              value={source.label}
                              onChange={(e) =>
                                setSourceField(
                                  ep.tmdb_id,
                                  sIdx,
                                  "label",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1 md:col-span-5">
                            <Label className="text-xs">Video URL (*)</Label>
                            <Input
                              placeholder="https://... .m3u8 hoặc .mp4"
                              value={source.video_url}
                              onChange={(e) =>
                                setSourceField(
                                  ep.tmdb_id,
                                  sIdx,
                                  "video_url",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => removeSource(ep.tmdb_id, sIdx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSource(ep.tmdb_id)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Thêm nguồn
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <Separator />
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                    tạo...
                  </>
                ) : (
                  "Xác nhận tạo phim"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
