import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";

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
import { useGetMovieDetailQuery } from "@/features/movie/movieApi";
import { useUpdateEpisodeMutation } from "@/features/series/seriesApi";

type Props = {
  movieId: string;
  info: MovieDetail;
};

export default function TvManageSource({ movieId: _movieId, info }: Props) {
  const navigate = useNavigate();

  const [getUploadUrl] = useGetCloudflareUploadUrlMutation();
  const { data: detail } = useGetMovieDetailQuery(_movieId);
  const [updateEpisode] = useUpdateEpisodeMutation();

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

  const seasons = detail?.seasons || [];

  const firstSeasonKey = useMemo(
    () => (seasons[0] ? `${seasons[0].id || seasons[0].seasonNumber}` : null),
    [seasons]
  );

  const selectedSeason = useMemo(() => {
    const key = selectedSeasonKey ?? firstSeasonKey;
    return seasons.find((s) => `${s.id || s.seasonNumber}` === key);
  }, [seasons, selectedSeasonKey, firstSeasonKey]);

  // Poll Cloudflare processing status khi đã có UID
  const { data: epStatusData } = useGetVideoStatusQuery(epUID, {
    skip: !epUID || epIsReady,
    pollingInterval: 10000,
  });

  const epEncodingPct = epStatusData ? Number(epStatusData.pctComplete) : 0;

  // React to status updates (useEffect để tránh setState trong render)
  useEffect(() => {
    if (!epStatusData || epIsReady) return;

    if (epStatusData.state === "ready") {
      setEpIsReady(true);
      setEpProgress(100);
      toast.success("Tập phim đã được xử lý và lưu thành công!");
    } else if (epStatusData.state === "error") {
      setEpIsReady(true);
      toast.error("Xử lý tập phim thất bại trên Cloudflare.");
    }
  }, [epStatusData, epIsReady]);

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
      const season = (detail?.seasons || []).find(
        (s) => s.seasonNumber === seasonNumber
      );
      const episode = (season?.episodes || []).find(
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
      toast.success("Đã tải lên! Đang xử lý video tập phim...");
    } catch (err) {
      console.error(err);
      toast.error("Tải lên thất bại");
    } finally {
      setBusyEp(null);
    }
  };

  const resetEpisodeUploadState = () => {
    setEpSelectedFile(null);
    setEpProgress(0);
    setEpUID("");
    setEpIsReady(false);
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

  return (
    <section className="mx-auto max-w-5xl pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isProcessingEp) {
              window.alert(
                "Vui lòng đợi video xử lý xong, rời đi lúc này có thể khiến source bị lỗi"
              );
              return;
            }
            navigate(-1);
          }}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-extrabold text-white">
          Quản Lý Nguồn (Phim Bộ)
        </h1>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6">
        {/* TV Info */}
        <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
          <div>
            <span className="text-zinc-500">Tiêu Đề</span>
            <div className="font-medium text-white">{info.title}</div>
          </div>
          <div>
            <span className="text-zinc-500">Poster</span>
            <div className="flex items-center gap-3">
              <div className="h-auto w-96 overflow-hidden rounded bg-zinc-800">
                {info.backdrop ? (
                  <img
                    src={info.backdrop}
                    alt="Poster"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                    N/A
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <span className="text-zinc-500">Năm Phát Hành</span>
            <div>{info.release}</div>
          </div>
          <div>
            <span className="text-zinc-500">Trạng Thái</span>
            <div>
              <Badge className="border-none bg-teal-600 hover:bg-teal-700">
                {info.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Seasons / Episodes */}
        <Tabs
          value={selectedSeasonKey ?? firstSeasonKey ?? undefined}
          onValueChange={(val) => {
            setSelectedSeasonKey(val);
            setSelectedEpisodeKey(null);
            resetEpisodeUploadState();
          }}
          className="w-full"
        >
          <TabsList className="flex flex-wrap">
            {seasons.length === 0 && (
              <p className="text-sm text-zinc-400">Không có mùa</p>
            )}
            {seasons.map((s) => {
              const key = `${s.id || s.seasonNumber}`;
              return (
                <TabsTrigger key={key} value={key} className="text-xs">
                  Mùa {s.seasonNumber}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {seasons.map((s) => {
            const key = `${s.id || s.seasonNumber}`;
            return (
              <TabsContent key={key} value={key} className="space-y-4">
                {/* Episode buttons */}
                <ScrollArea className="max-h-[40vh] pr-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {(s.episodes || []).map((ep) => {
                      const epKey = `${s.seasonNumber}-${ep.episodeNumber}`;
                      const hasSource = Boolean(ep.videoUrl);
                      const isActive = selectedEpisodeKey === epKey;

                      return (
                        <Button
                          key={epKey}
                          variant={isActive ? "default" : "outline"}
                          className={
                            isActive
                              ? "bg-teal-600 hover:bg-teal-700"
                              : "border-zinc-700 text-zinc-200"
                          }
                          onClick={() => {
                            setSelectedEpisodeKey(epKey);
                            resetEpisodeUploadState();
                          }}
                        >
                          Tập {ep.episodeNumber}
                          {hasSource && (
                            <CheckCircle className="ml-1 h-3 w-3 text-green-400" />
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
                    const selectedEp = (s.episodes || []).find(
                      (ep) => ep.episodeNumber === selectedEpNumber
                    );
                    const hasSource = Boolean(selectedEp?.videoUrl);
                    const isBusy = busyEp === selectedEpisodeKey;

                    return (
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Success banner when episode is ready */}
                        {epIsReady && (
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 p-3 border rounded-md transition-colors bg-green-900/20 border-green-800 text-green-400">
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
                          className={`rounded-lg border border-zinc-800 bg-zinc-900/40 ${
                            isBusy ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between p-3">
                            <span className="text-sm font-semibold text-white">
                              Tải lên nguồn tập {selectedEpNumber} mùa{" "}
                              {s.seasonNumber}
                            </span>
                            <Badge className="border-none bg-zinc-800 text-zinc-300">
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
                            className="relative aspect-video w-full cursor-pointer transition hover:bg-zinc-900/60"
                          >
                            {epSelectedFile ? (
                              <div className="flex h-full w-full items-center justify-center">
                                <div className="text-center">
                                  <p className="text-sm text-white font-medium">
                                    {epSelectedFile.name}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    Nhấp hoặc kéo thả để thay đổi file
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <DropzoneEmptyState>
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <span className="text-sm text-zinc-300">
                                    Kéo thả video tập phim
                                  </span>
                                  <span className="text-xs text-zinc-500">
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
                              <div className="flex justify-between text-xs text-zinc-400">
                                <span>Đang tải lên Cloud...</span>
                                <span>{epProgress}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="h-full bg-teal-500 transition-all duration-300 ease-out"
                                  style={{ width: `${epProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Encoding progress */}
                          {epUID && !epIsReady && epProgress === 100 && (
                            <div className="p-3 space-y-1 animate-pulse">
                              <div className="flex justify-between text-xs text-amber-500">
                                <span>Cloudflare Đang Xử Lý...</span>
                                <span>{epEncodingPct.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 transition-all duration-500"
                                  style={{ width: `${epEncodingPct}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 p-3">
                            <Button
                              variant="ghost"
                              disabled={isBusy}
                              onClick={resetEpisodeUploadState}
                            >
                              Đặt Lại
                            </Button>
                            <Button
                              disabled={!epSelectedFile || isBusy}
                              onClick={() => {
                                if (!epSelectedFile || isBusy) return;
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
                              className="bg-teal-600 hover:bg-teal-700 text-white"
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
                        <div className="rounded-lg border border-zinc-800 bg-black p-2">
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
                            <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-zinc-500">
                              Chưa có source cho tập này
                            </div>
                          )}
                          <p className="mt-2 text-[10px] text-zinc-500 text-center">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thay thế Source của tập này?</AlertDialogTitle>
            <AlertDialogDescription>
              Source tập sẽ được upload và thay thế bằng source mới. Điều này
              không thể thay đổi, vui lòng backup trước khi đồng ý.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
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
    </section>
  );
}
