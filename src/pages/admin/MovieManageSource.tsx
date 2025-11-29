// import { useState } from "react";
// import type { MovieDetail } from "@/types/movie";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import axios from "axios";
// import { useGetCloudflareUploadUrlMutation } from "@/features/movie/uploadApi";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// export default function MovieManageSource({
//   movieId: _movieId,
//   info,
// }: {
//   movieId: string;
//   info: MovieDetail;
// }) {
//   // Hook Cloudflare
//   const [getUploadUrl] = useGetCloudflareUploadUrlMutation();

//   const [progress, setProgress] = useState(0);
//   const [videoUID, setVideoUID] = useState<string>("");
//   const [busy, setBusy] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [showPreview, setShowPreview] = useState(true);
//   const navigate = useNavigate();
//   void _movieId; // silence unused param

//   // Chỉ chọn file, chưa upload
//   const handleSelectFile = (file?: File) => {
//     if (!file) return;
//     setSelectedFile(file);
//     setProgress(0);
//     setVideoUID("");
//   };

//   // Upload khi click Save Changes
//   const performUpload = async () => {
//     if (!selectedFile || busy) return;
//     setBusy(true);
//     setProgress(0);
//     try {
//       const { uploadUrl, videoUID: uid } = await getUploadUrl().unwrap();
//       const formData = new FormData();
//       formData.append("file", selectedFile);
//       await axios.post(uploadUrl, formData, {
//         onUploadProgress: (evt) => {
//           if (!evt.total) return;
//           const percent = Math.round((evt.loaded * 100) / evt.total);
//           setProgress(percent);
//         },
//       });
//       setVideoUID(uid);
//       toast.success("Uploaded movie source successfully!");
//       // (Optional) call updateMovie API here to persist uid
//     } catch (err) {
//       console.error(err);
//       toast.error("Upload failed");
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <section className="mx-auto max-w-3xl pb-20">
//       <div className="mb-6 flex items-center gap-3">
//         <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
//           <ArrowLeft className="size-5" />
//         </Button>
//         <h1 className="text-2xl font-extrabold text-white">Source Manager</h1>
//       </div>
// <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
//   <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
//     <div>
//       <span className="text-zinc-500">Title</span>
//       <div className="font-medium text-white">{info.title}</div>
//     </div>
//     <div>
//       <span className="text-zinc-500">Poster</span>
//       <div className="flex items-center gap-3">
//         <div className="h-18 w-12 overflow-hidden rounded bg-zinc-800">
//           {info.poster ? (
//             <img
//               src={info.poster}
//               alt="Poster"
//               className="h-full w-full object-cover"
//               loading="lazy"
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
//               N/A
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     <div>
//       <span className="text-zinc-500">Release Year</span>
//       <div>{info.release}</div>
//     </div>
//     <div>
//       <span className="text-zinc-500">Status</span>
//       <div>
//         <Badge className="border-none bg-teal-600 hover:bg-teal-700">
//           {info.status}
//         </Badge>
//       </div>
//     </div>
//   </div>

//         <div className="space-y-4 pt-4 border-t border-zinc-800">
//           <Label className="text-zinc-200 text-base font-semibold">
//             Upload Movie Source (Cloudflare)
//           </Label>

//           <div className="flex items-center gap-4">
//             <Input
//               type="file"
//               accept="video/*"
//               disabled={busy}
//               className="file:text-white file:bg-zinc-800 cursor-pointer"
//               onChange={(e) => handleSelectFile(e.target.files?.[0])}
//             />
//             {busy && <Loader2 className="animate-spin text-teal-500" />}
//           </div>
//           {selectedFile && !videoUID && (
//             <p className="text-xs text-zinc-400">
//               Ready to upload: {selectedFile.name}
//             </p>
//           )}

//           {/* Progress Bar */}
//           {progress > 0 && (
//             <div className="space-y-1">
//               <div className="flex justify-between text-xs text-zinc-400">
//                 <span>Uploading...</span>
//                 <span>{progress}%</span>
//               </div>
//               <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
//                 <div
//                   className="h-full bg-teal-500 transition-all duration-300 ease-out"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Result */}
//           {videoUID && (
//             <div className="space-y-3">
//               <div className="flex items-center gap-2 p-3 bg-teal-900/20 border border-teal-800 rounded-md text-teal-400">
//                 <CheckCircle className="h-5 w-5" />
//                 <div className="flex-1 overflow-hidden">
//                   <p className="text-xs font-semibold">Upload Complete!</p>
//                   <p className="text-xs truncate">Video UID: {videoUID}</p>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowPreview((v) => !v)}
//                   className="border-teal-700 text-teal-400 hover:bg-teal-800/30"
//                 >
//                   {showPreview ? "Hide" : "Preview"}
//                 </Button>
//               </div>
//               {showPreview && (
//                 <div className="rounded-md border border-zinc-800 bg-black p-2">
//                   {/* Cloudflare Stream Preview: using downloadable mp4 fallback; adjust if you store playback URL */}
//                   <video
//                     key={videoUID}
//                     controls
//                     playsInline
//                     className="w-full max-h-[360px] rounded"
//                   >
//                     <source
//                       src={`https://videodelivery.net/${videoUID}/downloads/default.mp4`}
//                       type="video/mp4"
//                     />
//                     <source
//                       src={`https://videodelivery.net/${videoUID}/manifest/video.m3u8`}
//                       type="application/x-mpegURL"
//                     />
//                     Your browser does not support the video tag.
//                   </video>
//                   <p className="mt-2 text-[10px] text-zinc-500">
//                     Playback from Cloudflare Stream (UID {videoUID}).
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="flex items-center justify-end gap-3 pt-4">
//           <Button
//             variant="ghost"
//             disabled={busy}
//             onClick={() => {
//               setProgress(0);
//               setVideoUID("");
//               setSelectedFile(null);
//             }}
//           >
//             Reset
//           </Button>
//           <Button
//             disabled={!selectedFile || busy}
//             onClick={performUpload}
//             className="bg-teal-600 hover:bg-teal-700 text-white"
//           >
//             {busy ? "Uploading..." : videoUID ? "Re-upload" : "Save Changes"}
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }

import { useState, useEffect, useRef } from "react";
import type { MovieDetail } from "@/types/movie";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useGetCloudflareUploadUrlMutation, useGetVideoStatusQuery } from "@/features/movie/uploadApi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/axios";
import {
  useUpdateMovieMutation,
} from "@/features/movie/movieApi";

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

  // State Encoding (MỚI)
  const [encodingProgress, setEncodingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  void _movieId;
  const { data: statusData, error: statusError } = useGetVideoStatusQuery(
    videoUID,
    {
      skip: !videoUID || isReady,
      pollingInterval: 3000, 
    }
  );
  const handleSelectFile = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setProgress(0);
    setVideoUID("");
    setEncodingProgress(0); // Reset encoding
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

  const performUpload = async () => {
    if (!selectedFile || busy) return;
    setBusy(true);
    setProgress(0);
    setEncodingProgress(0);
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
    } finally {
      setBusy(false);
    }
  };
 
  
  const encodingPct = statusData ? Number(statusData.pctComplete) : 0;
  const showEncoding = progress === 100 && !isReady && videoUID;

  return (
    <section className="mx-auto max-w-3xl pb-20">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-extrabold text-white">Source Manager</h1>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
          <div>
            <span className="text-zinc-500">Title</span>
            <div className="font-medium text-white">{info.title}</div>
          </div>
          <div>
            <span className="text-zinc-500">Poster</span>
            <div className="flex items-center gap-3">
              <div className="h-18 w-12 overflow-hidden rounded bg-zinc-800">
                {info.poster ? (
                  <img
                    src={info.poster}
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
            <div>{info.release}</div>
          </div>
          <div>
            <span className="text-zinc-500">Status</span>
            <div>
              <Badge className="border-none bg-teal-600 hover:bg-teal-700">
                {info.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <Label className="text-zinc-200 text-base font-semibold">
            Upload Movie Source (Cloudflare)
          </Label>

          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="video/*"
              disabled={busy}
              className="file:text-white file:bg-zinc-800 cursor-pointer"
              onChange={(e) => handleSelectFile(e.target.files?.[0])}
            />
            {busy && <Loader2 className="animate-spin text-teal-500" />}
          </div>

          {selectedFile && !videoUID && (
            <p className="text-xs text-zinc-400">
              Ready to upload: {selectedFile.name}
            </p>
          )}

          {/* 1. Upload Progress Bar */}
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

          {/* 2. Encoding Progress Bar (Hiển thị khi upload xong 100% nhưng chưa Ready) */}
          {showEncoding ? (
            <div className="space-y-1 animate-pulse">
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
          ) : null}

          {/* Result Block */}
          {videoUID && (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  isReady
                    ? "bg-green-900/20 border-green-800 text-green-400"
                    : "bg-teal-900/20 border-teal-800 text-teal-400"
                }`}
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

              {/* Preview Player (Chỉ hiện khi Ready) */}
              {showPreview && isReady && (
                <div className="rounded-md border border-zinc-800 bg-black p-2">
                  {/* Sử dụng iframe của Cloudflare Stream Player cho chuẩn */}
                  <iframe
                    src={`https://customer-avv2h3ae3kvexdfh.cloudflarestream.com/${videoUID}/iframe`}
                    className="w-full aspect-video rounded border-none"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                  ></iframe>

                  <p className="mt-2 text-[10px] text-zinc-500 text-center">
                    Playback from Cloudflare Stream via HLS.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setProgress(0);
              setEncodingProgress(0);
              setVideoUID("");
              setSelectedFile(null);
              setIsReady(false);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={!selectedFile || busy}
            onClick={performUpload}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {busy ? "Uploading..." : videoUID ? "Re-upload" : "Save Changes"}
          </Button>
        </div>
      </div>
    </section>
  );
}
