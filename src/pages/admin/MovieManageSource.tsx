import { useState, useEffect } from "react";
import type { MovieDetail } from "@/types/movie";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  useGetCloudflareUploadUrlMutation,
  useGetVideoStatusQuery,
} from "@/features/movie/uploadApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { movieApi } from "@/features/movie/movieApi";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  UploadCloud,
  Film,
  Calendar,
  Image,
  Video,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUpdateMovieMutation } from "@/features/movie/movieApi";
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
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function MovieManageSource({
  movieId: _movieId,
  info,
}: {
  movieId: string;
  info: MovieDetail;
}) {
  const [getUploadUrl] = useGetCloudflareUploadUrlMutation();
  const [updateMovieMutation] = useUpdateMovieMutation();
  // State Upload
  const [progress, setProgress] = useState(0);
  const [videoUID, setVideoUID] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [hideExistingPreview, setHideExistingPreview] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showLeaveWarningDialog, setShowLeaveWarningDialog] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const videoUrl = (info as any).videoUrl as string | undefined;
  const hasM3U8Source = Boolean(
    videoUrl && videoUrl.includes(".m3u8")
  );
  const hasExistingSource = Boolean(
    videoUrl &&
      (videoUrl.includes(".m3u8") || !videoUrl.startsWith("http"))
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  void _movieId;
  const { data: statusData } = useGetVideoStatusQuery(
    videoUID,
    {
      skip: !videoUID || isReady || !isProcessingVideo,
      pollingInterval: 10000,
    }
  );
  const handleSelectFile = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setProgress(0);
    setVideoUID("");

    setIsReady(false);
  };

  useEffect(() => {
    if (statusData) {
      if (statusData.state === "ready") {
        const wasNotReady = !isReady;
        setIsReady(true);
        setProgress(100);
        setIsProcessingVideo(false);
        if (wasNotReady) {
          toast.success("Video đã được xử lý và lưu thành công!");
          // Refetch movie info to get updated data
          dispatch(movieApi.endpoints.getMovieInfo.initiate(_movieId, { forceRefetch: true }) as any);
        }
      } else if (statusData.state === "error") {
        setIsReady(true); // Dừng poll
        setIsProcessingVideo(false);
        toast.error("Xử lý video thất bại trên Cloudflare.");
      }
    }
  }, [statusData, isReady, dispatch, _movieId]);

  // If an existing HLS (.m3u8) link is present, treat as READY and show preview
  useEffect(() => {
    if (hasM3U8Source) {
      setIsReady(true);
      setShowPreview(true);
      setProgress(100);
    }
  }, [hasM3U8Source]);

  const performUpload = async () => {
    if (!selectedFile || busy) return;
    setBusy(true);
    setProgress(0);

    setIsReady(false);

    try {
      // 1. Get URL
      const { uploadUrl, videoUID: uid } = await getUploadUrl().unwrap();
      const fd = new FormData();
      fd.append("videoUrl", uid);

      await updateMovieMutation({ id: _movieId, body: fd }).unwrap();

      const formData = new FormData();
      formData.append("file", selectedFile);

      // 2. Upload to Cloudflare
      await axios.post(uploadUrl, formData, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
        },
      });

      setVideoUID(uid);
      setIsProcessingVideo(true);
      toast.success("Đã tải lên! Đang xử lý video...");
    } catch (err) {
      console.error(err);
      toast.error("Tải lên thất bại");
      setHideExistingPreview(false);
      setShowPreview(true);
      setIsProcessingVideo(false);
    } finally {
      setBusy(false);
    }
  };

  const encodingPct = statusData ? Number(statusData.pctComplete) : 0;
  const showEncoding = progress === 100 && !isReady && videoUID;
  const isProcessing =
    busy ||
    showEncoding ||
    (progress > 0 && progress < 100) ||
    (!!videoUID && !isReady);

  // Warn and prevent page unload/navigation while processing
  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    if (isProcessing) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
    }
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [isProcessing]);

  // Block browser back/forward navigation
  useEffect(() => {
    if (!isProcessing) return;

    const handlePopState = (e: PopStateEvent) => {
      if (isProcessing) {
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
  }, [isProcessing]);

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
    if (isProcessing) {
      setShowProcessingDialog(true);
    }
  };
  return (
    <>
      {/* Overlay to block Header, Sidebar, and Footer when processing */}
      {isProcessing && (
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
            isProcessing ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={isProcessing ? handleOverlayClick : undefined}
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
          Quản Lý Nguồn
        </h1>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        {/* 2-column layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: Movie info */}
          <div 
            className={`space-y-6 transition-opacity ${
              isProcessing ? "opacity-40 pointer-events-none" : ""
            }`}
            onClick={isProcessing ? handleOverlayClick : undefined}
          >
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="flex items-center gap-2 text-gray-500">
                  <Film className="size-4 text-[#C40E61]" />
                  Tiêu Đề
                </span>
                <div className="font-medium text-gray-900 mt-1">{info.title}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Image className="size-4 text-[#C40E61]" />
                    Poster
                  </span>
                  <div className="h-auto w-96 overflow-hidden rounded bg-gray-200 border border-gray-300">
                    {info.poster ? (
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
                <div className="font-medium text-gray-900 mt-1">{info.release}</div>
              </div>

              <div>
                <span className="text-gray-500">Trạng Thái</span>
                <div className="mt-1">
                  <Badge className="border-none bg-emerald-600 hover:bg-emerald-700 text-white">
                    {info.status}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="flex items-center gap-2 text-gray-500">
                  <Video className="size-4 text-[#C40E61]" />
                  Trạng Thái Nguồn
                </span>
                <div className="mt-1">
                  <Badge
                    className={
                      isReady
                        ? "border-none bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-none bg-gray-600 text-white"
                    }
                  >
                    {isReady ? "SẴN SÀNG" : "CHƯA SẴN SÀNG"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Có thể thêm các info khác ở đây nếu cần */}
          </div>

          {/* RIGHT: Upload section */}
          <div className={`space-y-4 relative ${isProcessing ? "z-10" : ""}`}>
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                <UploadCloud className="size-5 text-[#C40E61]" />
                Tải Lên Nguồn Phim (Cloudflare)
              </Label>
              {!busy && (
                <Badge className="border-none bg-gray-100 text-gray-700 border border-gray-300">
                  MP4, MOV, MKV
                </Badge>
              )}
            </div>

            <div
              className={`
              overflow-hidden rounded-lg border border-gray-300 bg-white
              ${busy ? "opacity-60" : ""}
              ${isProcessing ? "pointer-events-none" : ""}
            `}
            >
              <Dropzone
                accept={{ "video/*": [] }}
                maxFiles={1}
                onDrop={(files) => handleSelectFile(files[0])}
                className="relative aspect-video w-full cursor-pointer transition hover:bg-gray-50"
              >
                {selectedFile ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <UploadCloud className="mx-auto mb-2 h-8 w-8 text-[#C40E61]" />
                      <p className="text-sm text-gray-900 font-medium">
                        {selectedFile.name}
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
                      <p className="text-sm text-gray-700">
                        Kéo thả video của bạn vào đây
                      </p>
                      <p className="text-xs text-gray-500">
                        Hoặc nhấp để duyệt
                      </p>
                    </div>
                  </DropzoneEmptyState>
                )}
                <DropzoneContent />
              </Dropzone>
            </div>

            {/* Upload Progress */}
            {progress > 0 && progress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Đang tải lên Cloud...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-[#C40E61] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Encoding Progress */}
            {showEncoding && (
              <div className="space-y-1 animate-pulse mt-2">
                <div className="flex justify-between text-xs text-amber-600">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Cloudflare
                    Processing...
                  </span>
                  <span>{encodingPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${encodingPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result Block + Preview */}
            {videoUID && (
              <div className="space-y-3">
                <div
                  className={`
                  flex items-center gap-2 p-3 border rounded-md transition-colors
                  ${
                    isReady
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-blue-50 border-blue-300 text-blue-700"
                  }
                `}
                >
                  {isReady ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}

                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-semibold">
                      {isReady ? "Video Sẵn Sàng Phát!" : "Đang xử lý..."}
                    </p>
                    <p className="text-xs truncate">UID: {videoUID}</p>
                  </div>

                  {isReady && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview((v) => !v)}
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      {showPreview ? "Ẩn" : "Xem Trước"}
                    </Button>
                  )}
                </div>

                {showPreview && isReady && (
                  <div className="rounded-md border border-gray-300 bg-black p-2">
                    <iframe
                      src={`https://customer-avv2h3ae3kvexdfh.cloudflarestream.com/${videoUID}/iframe`}
                      className="w-full aspect-video rounded border-none"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen
                    />
                    <p className="mt-2 text-[10px] text-gray-500 text-center">
                      Phát từ Cloudflare Stream qua HLS.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Existing HLS (.m3u8) Source Preview */}
            {!videoUID && hasM3U8Source && !hideExistingPreview && videoUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 border rounded-md transition-colors bg-green-50 border-green-300 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-semibold">
                      Video Sẵn Sàng Phát!
                    </p>
                    <p className="text-xs truncate">HLS: {videoUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview((v) => !v)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    {showPreview ? "Ẩn" : "Xem Trước"}
                  </Button>
                </div>

                {showPreview && (
                  <div className="rounded-md border border-gray-300 bg-black p-2">
                    <video
                      className="w-full aspect-video rounded"
                      controls
                      src={videoUrl}
                    />
                    <p className="mt-2 text-[10px] text-gray-500 text-center">
                      Xem trước nguồn HLS (.m3u8) hiện có.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div 
          className={`mt-6 flex items-center justify-end gap-3 border-t border-gray-300 pt-4 transition-opacity ${
            isProcessing ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={isProcessing ? handleOverlayClick : undefined}
        >
          <Button
            variant="ghost"
            disabled={Boolean(busy || isProcessing)}
            onClick={() => {
              setProgress(0);
              setVideoUID("");
              setSelectedFile(null);
              setIsReady(false);
              setIsProcessingVideo(false);
              setHideExistingPreview(false);
              setShowPreview(true);
            }}
            className="text-gray-700 hover:bg-gray-100"
          >
            Đặt Lại
          </Button>
          <Button
            disabled={Boolean(!selectedFile || busy || isProcessing)}
            onClick={() => {
              if (!selectedFile || busy || isProcessing) return;
              if (hasExistingSource) {
                setConfirmReplaceOpen(true);
              } else {
                void performUpload();
              }
            }}
            className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
          >
            {busy ? "Đang tải lên..." : videoUID ? "Tải lên lại" : "Lưu Thay Đổi"}
          </Button>
        </div>
      </div>

      {/* Confirm replace existing source */}
      <AlertDialog
        open={confirmReplaceOpen}
        onOpenChange={setConfirmReplaceOpen}
      >
        <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="size-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <AlertDialogTitle className="text-gray-900">Thay thế Source hiện tại?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 mt-2">
                  Source phim sẽ được upload và thay thế bằng source mới. Điều này
                  không thể thay đổi, Vui lòng backup trước khi đồng ý.
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
                setHideExistingPreview(true);
                setShowPreview(false);
                void performUpload();
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
