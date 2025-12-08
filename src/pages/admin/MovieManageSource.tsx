import { useState, useEffect, useRef } from "react";
import type { MovieDetail } from "@/types/movie";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  useGetCloudflareUploadUrlMutation,
  useGetVideoStatusQuery,
} from "@/features/movie/uploadApi";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/axios";
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
  const defaultUid =
    info.videoUrl && !info.videoUrl.startsWith("http") ? info.videoUrl : "";
  const [videoUID, setVideoUID] = useState<string>(defaultUid);
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [hideExistingPreview, setHideExistingPreview] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const hasM3U8Source = Boolean(
    info.videoUrl && info.videoUrl.includes(".m3u8")
  );
  const hasExistingSource = Boolean(
    info.videoUrl &&
      (info.videoUrl.includes(".m3u8") || !info.videoUrl.startsWith("http"))
  );

  const navigate = useNavigate();
  void _movieId;
  const { data: statusData, error: statusError } = useGetVideoStatusQuery(
    videoUID,
    {
      skip: !videoUID || isReady,
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
        setIsReady(true);
        setProgress(100);
        if (!isReady) toast.success("Video processed & saved successfully!");
      } else if (statusData.state === "error") {
        setIsReady(true); // Dừng poll
        toast.error("Video processing failed on Cloudflare.");
      }
    }
  }, [statusData, isReady]);

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
      toast.success("Uploaded! Processing video...");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setHideExistingPreview(false);
      setShowPreview(true);
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
  return (
    <section className="mx-auto max-w-5xl pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isProcessing) {
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
        <h1 className="text-2xl font-extrabold text-white">Source Manager</h1>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        {/* 2-column layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: Movie info */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300">
              <div>
                <span className="text-zinc-500">Title</span>
                <div className="font-medium text-white">{info.title}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500">Poster</span>
                  <div className="h-auto w-96 overflow-hidden rounded bg-zinc-800">
                    {info.poster ? (
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
                <span className="text-zinc-500">Release Year</span>
                <div className="font-medium text-white">{info.release}</div>
              </div>

              <div>
                <span className="text-zinc-500">Status</span>
                <div className="mt-1">
                  <Badge className="border-none bg-teal-600 hover:bg-teal-700">
                    {info.status}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-zinc-500">Source Status</span>
                <div className="mt-1">
                  <Badge
                    className={
                      isReady
                        ? "border-none bg-teal-600 hover:bg-teal-700"
                        : "border-none bg-zinc-700 text-zinc-200"
                    }
                  >
                    {isReady ? "READY" : "NOT READY"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Có thể thêm các info khác ở đây nếu cần */}
          </div>

          {/* RIGHT: Upload section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-200 text-base font-semibold">
                Upload Movie Source (Cloudflare)
              </Label>
              {!busy && (
                <Badge className="border-none bg-zinc-800 text-zinc-300">
                  MP4, MOV, MKV
                </Badge>
              )}
            </div>

            <div
              className={`
              overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40
              ${busy ? "opacity-60" : ""}
            `}
            >
              <Dropzone
                accept={{ "video/*": [] }}
                maxFiles={1}
                onDrop={(files) => handleSelectFile(files[0])}
                className="relative aspect-video w-full cursor-pointer transition hover:bg-zinc-900/60"
              >
                {selectedFile ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <UploadCloud className="mx-auto mb-2 h-8 w-8 text-teal-400" />
                      <p className="text-sm text-white font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Click or drop to change file
                      </p>
                    </div>
                  </div>
                ) : (
                  <DropzoneEmptyState>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UploadCloud className="h-8 w-8 text-zinc-400" />
                      <p className="text-sm text-zinc-300">
                        Drag and drop your video here
                      </p>
                      <p className="text-xs text-zinc-500">
                        Or click to browse
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
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Uploading to Cloud...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Encoding Progress */}
            {showEncoding && (
              <div className="space-y-1 animate-pulse mt-2">
                <div className="flex justify-between text-xs text-amber-500">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Cloudflare
                    Processing...
                  </span>
                  <span>{encodingPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
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
                      ? "bg-green-900/20 border-green-800 text-green-400"
                      : "bg-teal-900/20 border-teal-800 text-teal-400"
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
                      {isReady ? "Video Ready to Stream!" : "Processing..."}
                    </p>
                    <p className="text-xs truncate">UID: {videoUID}</p>
                  </div>

                  {isReady && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview((v) => !v)}
                      className="border-green-700 text-green-400 hover:bg-green-800/30"
                    >
                      {showPreview ? "Hide" : "Preview"}
                    </Button>
                  )}
                </div>

                {showPreview && isReady && (
                  <div className="rounded-md border border-zinc-800 bg-black p-2">
                    <iframe
                      src={`https://customer-avv2h3ae3kvexdfh.cloudflarestream.com/${videoUID}/iframe`}
                      className="w-full aspect-video rounded border-none"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen
                    />
                    <p className="mt-2 text-[10px] text-zinc-500 text-center">
                      Playback from Cloudflare Stream via HLS.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Existing HLS (.m3u8) Source Preview */}
            {!videoUID && hasM3U8Source && !hideExistingPreview && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 border rounded-md transition-colors bg-green-900/20 border-green-800 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-semibold">
                      Video Ready to Stream!
                    </p>
                    <p className="text-xs truncate">HLS: {info.videoUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview((v) => !v)}
                    className="border-green-700 text-green-400 hover:bg-green-800/30"
                  >
                    {showPreview ? "Hide" : "Preview"}
                  </Button>
                </div>

                {showPreview && (
                  <div className="rounded-md border border-zinc-800 bg-black p-2">
                    <video
                      className="w-full aspect-video rounded"
                      controls
                      src={info.videoUrl as string}
                    />
                    <p className="mt-2 text-[10px] text-zinc-500 text-center">
                      Previewing existing HLS (.m3u8) source.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setProgress(0);

              setVideoUID("");
              setSelectedFile(null);
              setIsReady(false);
              setHideExistingPreview(false);
              setShowPreview(true);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={!selectedFile || busy}
            onClick={() => {
              if (!selectedFile || busy) return;
              if (hasExistingSource) {
                setConfirmReplaceOpen(true);
              } else {
                void performUpload();
              }
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {busy ? "Uploading..." : videoUID ? "Re-upload" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Confirm replace existing source */}
      <AlertDialog
        open={confirmReplaceOpen}
        onOpenChange={setConfirmReplaceOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thay thế Source hiện tại?</AlertDialogTitle>
            <AlertDialogDescription>
              Source phim sẽ được upload và thay thế bằng source mới. Điều này
              không thể thay đổi, Vui lòng backup trước khi đồng ý.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
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
    </section>
  );
}
