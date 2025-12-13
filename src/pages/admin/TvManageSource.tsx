import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Video, Film, Calendar, Image, UploadCloud, AlertCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

import {
  useGetCloudflareUploadUrlMutation,
  useGetVideoStatusQuery,
} from "@/features/movie/uploadApi";

import type { MovieDetail } from "@/types/movie";
import { useGetMovieInfoQuery, movieApi } from "@/features/movie/movieApi";
import { useUpdateEpisodeMutation, useGetEpisodesBySeasonMutation } from "@/features/series/seriesApi";

type Props = {
  movieId: string;
  info: MovieDetail;
};

export default function TvManageSource({ movieId: _movieId, info }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getUploadUrl] = useGetCloudflareUploadUrlMutation();
  const { data: detail } = useGetMovieInfoQuery(_movieId);
  const [updateEpisode] = useUpdateEpisodeMutation();
  const [getEpisodesBySeason] = useGetEpisodesBySeasonMutation();

  // Episode upload state
  const [busyEp, setBusyEp] = useState<string | null>(null);
  const [selectedSeasonKey, setSelectedSeasonKey] = useState<string | null>(
    null
  );
  const [selectedEpisodeKey, setSelectedEpisodeKey] = useState<string | null>(
    null
  );

  const [epSelectedFile, setEpSelectedFile] = useState<File | null>(null);
  const [epProgress, setEpProgress] = useState<number>(0);
  const [epUID, setEpUID] = useState<string>("");
  const [epIsReady, setEpIsReady] = useState<boolean>(false);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState<boolean>(false);
  const [isProcessingEpisode, setIsProcessingEpisode] = useState<boolean>(false);
  const [showLeaveWarningDialog, setShowLeaveWarningDialog] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  
  // State để lưu episodes theo season
  const [episodesBySeason, setEpisodesBySeason] = useState<Record<string, Array<{
    id?: string;
    episodeNumber: number;
    videoUrl?: string;
  }>>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<string, boolean>>({});

  type SeasonType = {
    id?: string;
    seasonNumber: number;
    episodes?: Array<{
      id?: string;
      episodeNumber: number;
      videoUrl?: string;
    }>;
  };
  const seasons: SeasonType[] = (detail as unknown as { seasons?: SeasonType[] })?.seasons || [];

  const firstSeasonKey = useMemo(
    () => (seasons[0] ? `${seasons[0].id || seasons[0].seasonNumber}` : null),
    [seasons]
  );

  const selectedSeason = useMemo(() => {
    const key = selectedSeasonKey ?? firstSeasonKey;
    return seasons.find((s) => `${s.id || s.seasonNumber}` === key);
  }, [seasons, selectedSeasonKey, firstSeasonKey]);

  // Load episodes khi season được chọn
  useEffect(() => {
    const currentSeasonKey = selectedSeasonKey ?? firstSeasonKey;
    if (!currentSeasonKey) return;
    
    const season = seasons.find((s) => `${s.id || s.seasonNumber}` === currentSeasonKey);
    if (!season || !season.id) return;
    
    // Nếu đã có episodes trong cache thì không cần fetch lại
    if (episodesBySeason[season.id]) return;
    
    // Nếu season đã có episodes từ getMovieInfo (không null và có length > 0) thì không cần fetch lại
    if (season.episodes && season.episodes.length > 0) {
      // Lưu episodes từ detail vào cache để sử dụng thống nhất
      setEpisodesBySeason((prev) => ({
        ...prev,
        [season.id!]: season.episodes!,
      }));
      return;
    }
    
    // Nếu đang loading thì không fetch lại
    if (loadingEpisodes[season.id]) return;
    
    // Fetch episodes
    setLoadingEpisodes((prev) => ({ ...prev, [season.id!]: true }));
    getEpisodesBySeason({ seasonId: season.id })
      .unwrap()
      .then((episodes) => {
        setEpisodesBySeason((prev) => ({
          ...prev,
          [season.id!]: episodes.map((ep: any) => ({
            id: ep.id,
            episodeNumber: ep.episodeNumber,
            videoUrl: ep.videoUrl,
          })),
        }));
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        toast.error("Không thể tải danh sách tập phim");
      })
      .finally(() => {
        setLoadingEpisodes((prev) => {
          const next = { ...prev };
          delete next[season.id!];
          return next;
        });
      });
  }, [selectedSeasonKey, firstSeasonKey, seasons, episodesBySeason, loadingEpisodes, getEpisodesBySeason]);

  // Poll Cloudflare processing status khi đã có UID và đang xử lý
  const { data: epStatusData } = useGetVideoStatusQuery(epUID, {
    skip: !epUID || epIsReady || !isProcessingEpisode,
    pollingInterval: 10000,
  });

  const epEncodingPct = epStatusData ? Number(epStatusData.pctComplete) : 0;

  // React to status updates (useEffect để tránh setState trong render)
  useEffect(() => {
    if (!epStatusData || epIsReady) return;

    if (epStatusData.state === "ready") {
      const wasNotReady = !epIsReady;
      setEpIsReady(true);
      setEpProgress(100);
      setIsProcessingEpisode(false);
      if (wasNotReady) {
        toast.success("Tập phim đã được xử lý và lưu thành công!");
        // Refetch movie info to get updated data
        dispatch(movieApi.endpoints.getMovieInfo.initiate(_movieId, { forceRefetch: true }) as any);
      }
    } else if (epStatusData.state === "error") {
      setEpIsReady(true);
      setIsProcessingEpisode(false);
      toast.error("Xử lý tập phim thất bại trên Cloudflare.");
    }
  }, [epStatusData, epIsReady, dispatch, _movieId]);

  const handleUploadEpisode = async (
    file: File | undefined,
    epKey: string | null
  ) => {
    if (!file || !epKey) return;

    setBusyEp(epKey);
    try {
      const { uploadUrl, videoUID: uid } = await getUploadUrl().unwrap();
      const fd = new FormData();
      fd.append("videoUrl", uid);
      // Resolve selected episode by key to get its id
      const [seasonNumberStr, episodeNumberStr] = (epKey || "").split("-");
      const seasonNumber = Number(seasonNumberStr);
      const episodeNumber = Number(episodeNumberStr);
      const seasonsForUpload: SeasonType[] = (detail as unknown as { seasons?: SeasonType[] })?.seasons || [];
      const season = seasonsForUpload.find(
        (s) => s.seasonNumber === seasonNumber
      );
      // Tìm episode từ state hoặc từ detail
      const seasonEpisodes = season?.id && episodesBySeason[season.id]
        ? episodesBySeason[season.id]
        : (season?.episodes || []);
      const episode = seasonEpisodes.find(
        (e) => e.episodeNumber === episodeNumber
      );
      if (!episode?.id) {
        throw new Error("Episode ID not found for update");
      }
      await updateEpisode({ id: String(episode.id), body: {videoUrl: uid} }).unwrap();
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(uploadUrl, formData, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setEpProgress(percent);
        },
      });

      setEpUID(uid);
      setEpIsReady(false);
      setIsProcessingEpisode(true);
      toast.success("Đã tải lên! Đang xử lý video tập phim...");
    } catch (err) {
      console.error(err);
      toast.error("Tải lên thất bại");
      setIsProcessingEpisode(false);
    } finally {
      setBusyEp(null);
    }
  };

  const resetEpisodeUploadState = () => {
    setEpSelectedFile(null);
    setEpProgress(0);
    setEpUID("");
    setEpIsReady(false);
    setIsProcessingEpisode(false);
    setBusyEp(null);
  };

  // Detect processing state to guard navigation
  const isProcessingEp =
    !!busyEp || (!!epUID && !epIsReady) || (epProgress > 0 && epProgress < 100);

  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (isProcessingEp) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    if (isProcessingEp) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
    }
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [isProcessingEp]);

  // Block browser back/forward navigation
  useEffect(() => {
    if (!isProcessingEp) return;

    const handlePopState = (e: PopStateEvent) => {
      if (isProcessingEp) {
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);
        setShowLeaveWarningDialog(true);
      }
    };

    // Push a state to prevent back navigation
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isProcessingEp]);

  // Handle cancel leave (for browser back button)
  const handleCancelLeave = () => {
    setShowLeaveWarningDialog(false);
  };

  // Handle confirm leave (for browser back button)
  const handleConfirmLeave = () => {
    setShowLeaveWarningDialog(false);
    navigate("/admin/movies");
  };

  // Handle click on overlay when processing
  const handleOverlayClick = () => {
    if (isProcessingEp) {
      setShowProcessingDialog(true);
    }
  };

  return (
    <>
      {/* Overlay to block Header, Sidebar, and Footer when processing */}
      {isProcessingEp && (
        <>
          {/* Overlay for Header */}
          <div
            className="fixed top-0 left-0 right-0 h-16 bg-black/10 backdrop-blur-[2px] z-[100] cursor-not-allowed pointer-events-auto"
            onClick={handleOverlayClick}
            onContextMenu={(e) => {
              e.preventDefault();
              handleOverlayClick();
            }}
          />
          {/* Overlay for Sidebar (AdminLayout) */}
          <div
            className="fixed top-16 left-0 bottom-0 w-[280px] bg-black/10 backdrop-blur-[2px] z-[100] cursor-not-allowed pointer-events-auto hidden lg:block"
            onClick={handleOverlayClick}
            onContextMenu={(e) => {
              e.preventDefault();
              handleOverlayClick();
            }}
          />
          {/* Overlay for Footer */}
          <div
            className="fixed bottom-0 left-0 right-0 bg-black/10 backdrop-blur-[2px] z-[100] cursor-not-allowed pointer-events-auto"
            onClick={handleOverlayClick}
            onContextMenu={(e) => {
              e.preventDefault();
              handleOverlayClick();
            }}
            style={{ height: "200px" }}
          />
        </>
      )}
      <section className="mx-auto max-w-5xl pb-20 relative">
        {/* Header */}
        <div 
          className={`mb-6 flex items-center gap-3 transition-opacity ${
            isProcessingEp ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={isProcessingEp ? handleOverlayClick : undefined}
        >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/movies")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Video className="size-6 text-[#C40E61]" />
          Quản Lý Nguồn Video (Phim Bộ)
        </h1>
      </div>

      <div className="rounded-xl border border-gray-300 bg-white p-6 space-y-6 shadow-sm">
        {/* TV Info */}
        <div 
          className={`grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 transition-opacity ${
            isProcessingEp ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={isProcessingEp ? handleOverlayClick : undefined}
        >
          <div>
            <span className="flex items-center gap-2 text-gray-500">
              <Film className="size-4 text-[#C40E61]" />
              Tiêu Đề
            </span>
            <div className="font-medium text-gray-900 mt-1">{info.title}</div>
          </div>
          <div>
            <span className="flex items-center gap-2 text-gray-500">
              <Image className="size-4 text-[#C40E61]" />
              Poster
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-auto w-96 overflow-hidden rounded bg-gray-200 border border-gray-300">
                {info.backdrop ? (
                  <img
                    src={info.backdrop}
                    alt="Poster"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                    N/A
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <span className="flex items-center gap-2 text-gray-500">
              <Calendar className="size-4 text-[#C40E61]" />
              Năm Phát Hành
            </span>
            <div className="text-gray-900 mt-1">{info.release}</div>
          </div>
          <div>
            <span className="text-gray-500">Trạng Thái</span>
            <div className="mt-1">
              <Badge className="border-none bg-emerald-600 hover:bg-emerald-700 text-white">
                {info.status === "DRAFT" ? "Bản nháp" : info.status === "PUBLISHED" ? "Đã xuất bản" : info.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Seasons / Episodes */}
        <Tabs
          value={selectedSeasonKey ?? firstSeasonKey ?? undefined}
          onValueChange={(val) => {
            if (isProcessingEp) {
              setShowProcessingDialog(true);
              return;
            }
            setSelectedSeasonKey(val);
            setSelectedEpisodeKey(null);
            resetEpisodeUploadState();
          }}
          className="w-full"
        >
          <TabsList 
            className={`flex flex-wrap bg-gray-100 transition-opacity ${
              isProcessingEp ? "opacity-40 pointer-events-none" : ""
            }`}
            onClick={isProcessingEp ? handleOverlayClick : undefined}
          >
            {seasons.length === 0 && (
              <p className="text-sm text-gray-500">Không có mùa</p>
            )}
            {seasons.map((s) => {
              const key = `${s.id || s.seasonNumber}`;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="text-xs data-[state=active]:bg-[#C40E61] data-[state=active]:text-white"
                >
                  Mùa {s.seasonNumber}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {seasons.map((s) => {
            const key = `${s.id || s.seasonNumber}`;
            // Sử dụng episodes từ state nếu có, nếu không thì dùng từ detail
            const episodes = s.id && episodesBySeason[s.id] 
              ? episodesBySeason[s.id] 
              : (s.episodes || []);
            const isLoading = s.id ? loadingEpisodes[s.id] : false;
            
            return (
              <TabsContent key={key} value={key} className="space-y-4">
                {/* Episode buttons */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                    Đang tải danh sách tập phim...
                  </div>
                )}
                <ScrollArea 
                  className={`max-h-[40vh] pr-2 transition-opacity ${
                    isProcessingEp ? "opacity-40 pointer-events-none" : ""
                  }`}
                  onClick={isProcessingEp ? handleOverlayClick : undefined}
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {episodes.map((ep) => {
                      const epKey = `${s.seasonNumber}-${ep.episodeNumber}`;
                      const hasSource = Boolean(ep.videoUrl);
                      const isActive = selectedEpisodeKey === epKey;

                      return (
                        <Button
                          key={epKey}
                          variant={isActive ? "default" : "outline"}
                          className={
                            isActive
                              ? "bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                              : "border-gray-300 text-gray-700 hover:bg-gray-100"
                          }
                          onClick={() => {
                            setSelectedEpisodeKey(epKey);
                            resetEpisodeUploadState();
                          }}
                        >
                          Tập {ep.episodeNumber}
                          {hasSource && (
                            <CheckCircle className="ml-1 h-3 w-3 text-emerald-600" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Upload panel cho episode đang chọn */}
                {selectedEpisodeKey &&
                  selectedEpisodeKey.startsWith(`${s.seasonNumber}-`) &&
                  (() => {
                    const selectedEpNumber = Number(
                      selectedEpisodeKey.split("-")[1]
                    );
                    const selectedEp = episodes.find(
                      (ep) => ep.episodeNumber === selectedEpNumber
                    );
                    const hasSource = Boolean(selectedEp?.videoUrl);
                    const isBusy = busyEp === selectedEpisodeKey;

                    return (
                      <div className={`grid gap-4 md:grid-cols-2 relative ${isProcessingEp ? "z-10 opacity-100" : ""}`}>
                        {/* Success banner when episode is ready */}
                        {epIsReady && (
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 p-3 border rounded-md transition-colors bg-green-50 border-green-300 text-green-700">
                              <CheckCircle className="h-5 w-5" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-semibold">
                                  Video Sẵn Sàng Phát!
                                </p>
                                <p className="text-xs truncate">
                                  {epUID
                                    ? `UID: ${epUID}`
                                    : selectedEp?.videoUrl?.includes(".m3u8")
                                      ? `HLS: ${String(selectedEp?.videoUrl)}`
                                      : selectedEp?.videoUrl
                                        ? `URL: ${String(selectedEp?.videoUrl)}`
                                        : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* LEFT: Dropzone + progress + actions */}
                        <div
                          className={`rounded-lg border border-gray-300 bg-white ${
                            isBusy ? "opacity-60" : ""
                          } ${isProcessingEp ? "pointer-events-none" : ""}`}
                        >
                          <div className="flex items-center justify-between p-3">
                            <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                              <UploadCloud className="size-4 text-[#C40E61]" />
                              Tải lên nguồn tập {selectedEpNumber} mùa{" "}
                              {s.seasonNumber}
                            </span>
                            <Badge className="border-none bg-gray-100 text-gray-700 border border-gray-300">
                              MP4, MOV, MKV
                            </Badge>
                          </div>

                          <Dropzone
                            accept={{ "video/*": [] }}
                            maxFiles={1}
                            onDrop={(files) => {
                              const f = files[0];
                              setEpSelectedFile(f || null);
                              setEpProgress(0);
                              setEpUID("");
                              setEpIsReady(false);
                            }}
                            className="relative aspect-video w-full cursor-pointer transition hover:bg-gray-50"
                          >
                            {epSelectedFile ? (
                              <div className="flex h-full w-full items-center justify-center">
                                <div className="text-center">
                                  <UploadCloud className="mx-auto mb-2 h-8 w-8 text-[#C40E61]" />
                                  <p className="text-sm text-gray-900 font-medium">
                                    {epSelectedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Nhấp hoặc kéo thả để thay đổi file
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <DropzoneEmptyState>
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <UploadCloud className="h-8 w-8 text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    Kéo thả video tập phim
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Hoặc nhấp để duyệt
                                  </span>
                                </div>
                              </DropzoneEmptyState>
                            )}
                            <DropzoneContent />
                          </Dropzone>

                          {/* Upload progress */}
                          {epProgress > 0 && epProgress < 100 && (
                            <div className="p-3 space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Đang tải lên Cloud...</span>
                                <span>{epProgress}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full bg-[#C40E61] transition-all duration-300 ease-out"
                                  style={{ width: `${epProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Encoding progress */}
                          {epUID && !epIsReady && epProgress === 100 && (
                            <div className="p-3 space-y-1 animate-pulse">
                              <div className="flex justify-between text-xs text-amber-600">
                                <span>Cloudflare Đang Xử Lý...</span>
                                <span>{epEncodingPct.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 transition-all duration-500"
                                  style={{ width: `${epEncodingPct}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className={`flex items-center justify-end gap-3 border-t border-gray-300 p-3 ${isProcessingEp ? "pointer-events-none opacity-50" : ""}`}>
                            <Button
                              variant="ghost"
                              disabled={isBusy || isProcessingEp}
                              onClick={resetEpisodeUploadState}
                              className="text-gray-700 hover:bg-gray-100"
                            >
                              Đặt Lại
                            </Button>
                            <Button
                              disabled={!epSelectedFile || isBusy || isProcessingEp}
                              onClick={() => {
                                if (!epSelectedFile || isBusy || isProcessingEp) return;
                                const hasExistingSource = Boolean(
                                  selectedEp?.videoUrl &&
                                    (selectedEp?.videoUrl.includes(".m3u8") ||
                                      !String(selectedEp?.videoUrl).startsWith(
                                        "http"
                                      ))
                                );
                                if (hasExistingSource) {
                                  setConfirmReplaceOpen(true);
                                } else {
                                  void handleUploadEpisode(
                                    epSelectedFile || undefined,
                                    selectedEpisodeKey
                                  );
                                }
                              }}
                              className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                            >
                              {isBusy
                                ? "Đang tải lên..."
                                : epUID
                                  ? "Tải lên lại"
                                  : "Lưu Thay Đổi"}
                            </Button>
                          </div>
                        </div>

                        {/* RIGHT: Preview source hiện tại */}
                        <div className="rounded-lg border border-gray-300 bg-black p-2">
                          {epIsReady && epUID ? (
                            <div className="space-y-2">
                              <iframe
                                src={`https://customer-avv2h3ae3kvexdfh.cloudflarestream.com/${epUID}/iframe`}
                                className="w-full aspect-video rounded border-none"
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowFullScreen
                              />
                              <p className="text-[10px] text-zinc-500 text-center">
                                Phát từ Cloudflare Stream qua HLS.
                              </p>
                            </div>
                          ) : hasSource ? (
                            <video
                              className="w-full aspect-video rounded"
                              controls
                              src={String(selectedEp?.videoUrl)}
                            />
                          ) : (
                            <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-gray-500">
                              Chưa có source cho tập này
                            </div>
                          )}
                          <p className="mt-2 text-[10px] text-gray-500 text-center">
                            {epIsReady && epUID
                              ? "Xem trước nguồn tập mới đã tải lên."
                              : hasSource
                                ? "Xem trước nguồn tập hiện có."
                                : "Không có nguồn để xem trước."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Confirm replace existing episode source */}
      <AlertDialog
        open={confirmReplaceOpen}
        onOpenChange={setConfirmReplaceOpen}
      >
        <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="size-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <AlertDialogTitle className="text-gray-900">Thay thế Source của tập này?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 mt-2">
                  Source tập sẽ được upload và thay thế bằng source mới. Điều này
                  không thể thay đổi, vui lòng backup trước khi đồng ý.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setConfirmReplaceOpen(false);
                void handleUploadEpisode(
                  epSelectedFile || undefined,
                  selectedEpisodeKey
                );
              }}
            >
              Đồng ý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Warning Dialog - Only shown when trying to navigate */}
      <ConfirmDialog
        isOpen={showLeaveWarningDialog}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title="Cảnh báo: Đang xử lý video"
        description="Bạn đang trong quá trình upload hoặc xử lý video. Rời khỏi trang lúc này có thể dẫn đến sai lệch dữ liệu và làm gián đoạn quá trình xử lý. Bạn có chắc chắn muốn rời khỏi trang?"
        confirmText="Rời khỏi trang"
        cancelText="Ở lại"
        variant="destructive"
      />

      {/* Processing Dialog - Only close button, no confirm */}
      <AlertDialog open={showProcessingDialog} onOpenChange={setShowProcessingDialog}>
        <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="size-6 text-[#C40E61] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <AlertDialogTitle className="text-gray-900">
                  Đang xử lý video
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 mt-2">
                  Bạn đang trong quá trình upload hoặc xử lý video. Vui lòng đợi quá trình hoàn tất trước khi thực hiện các thao tác khác. Rời khỏi trang hoặc thao tác lúc này có thể dẫn đến sai lệch dữ liệu.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white border-none">
              Đã hiểu
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </section>
    </>
  );
}
