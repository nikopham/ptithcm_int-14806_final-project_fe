// src/pages/admin/MovieEditPage.jsx
// TÁI SỬ DỤNG HẦU HẾT CODE CỦA MOVIEIMPORTER

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom"; // Thêm hook
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
import { Loader2, X, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearImportFormDetails,
  clearMoviesSearchResult,
  // (Bạn có thể không cần các action tìm kiếm ở đây)
} from "@/features/movie/movieSlice";
import {
  getMovieDetailsForEdit, // Service mới
  updateMovieForm, // Service mới
} from "@/services/movieService";

export const MovieEditPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { movieId } = useParams(); // Lấy ID phim từ URL

  const {
    loading,
    importFormDetails, // Dùng lại state này
  } = useSelector((state) => state.movie);

  const [form, setForm] = useState(null);

  // 1. TẢI DỮ LIỆU KHI MỞ TRANG
  useEffect(() => {
    if (movieId) {
      const loadDetails = async () => {
        try {
          await getMovieDetailsForEdit(dispatch, movieId);
        } catch (error) {
          toast.error(error.message || "Lỗi khi tải dữ liệu phim.");
          navigate("/admin-dashboard/movie-list"); // Quay về danh sách nếu lỗi
        }
      };
      loadDetails();
    }
    // Dọn dẹp state khi rời trang
    return () => {
      dispatch(clearImportFormDetails());
    };
  }, [dispatch, movieId, navigate]);

  // Đồng bộ state Redux vào state local
  useEffect(() => {
    setForm(importFormDetails);
  }, [importFormDetails]);

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
    dispatch(clearImportFormDetails());
    dispatch(clearMoviesSearchResult());
    navigate("/admin-dashboard/movie-list");
  };

  const handleSubmit = async () => {
    try {
      // 2. GỌI HÀM UPDATE
      const res = await updateMovieForm(dispatch, movieId, form);
      toast.success(res.message || "Cập nhật phim thành công!");
      navigate("/admin-dashboard/movie-list"); // Quay về danh sách
    } catch (error) {
      toast.error(error.message || "Cập nhật thất bại.");
    }
  };

  // --- RENDER ---

  if (loading && !form) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Đang tải chi tiết phim...</p>
      </div>
    );
  }

  if (!form) {
    return null; // Hoặc một thông báo lỗi
  }

  return (
    <div className="space-y-6">
      {/* 1. KHU VỰC TÌM KIẾM (ĐÃ BỊ XÓA) */}
      {/* Chúng ta không cần tìm kiếm ở trang Sửa */}

      {/* 2. KHU VỰC FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa phim: {form.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* THÔNG TIN READ-ONLY */}
          <div className="space-y-4 opacity-70">
            {" "}
            {/* Thêm opacity để biết là read-only */}
            <h4 className="font-semibold">
              Thông tin phim (TMDb) - (Không thể sửa)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <img
                src={form.poster_url}
                alt="poster"
                className="rounded-lg md:col-span-1"
              />
              <div className="space-y-4 md:col-span-3">
                {/* THÊM disabled VÀO ĐÂY */}
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

          {/* TRẠNG THÁI (EDITABLE) - KHÔNG ĐỔI */}
          <div className="space-y-2 max-w-xs">
            <Label>Trạng thái (*)</Label>
            <Select value={form.status} onValueChange={setFormStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Đang chờ (Pending)</SelectItem>
                <SelectItem value="published">Công khai (Published)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* THÔNG TIN TẬP PHIM (EDITABLE) - KHÔNG ĐỔI */}
          <div className="space-y-4">
            <h4 className="font-semibold">
              Danh sách tập ({form.type === "movie" ? "Phim lẻ" : "Phim bộ"})
            </h4>
            <div className="space-y-6">
              {form.episodes.map((ep) => (
                <Card key={ep.tmdb_id || ep.id} className="bg-muted/30">
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập
                  nhật...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
