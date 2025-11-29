import { useState } from "react";
import type { MovieDetail } from "@/types/movie";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useGetCloudflareUploadUrlMutation } from "@/features/movie/uploadApi";
import { useGetMovieDetailQuery } from "@/features/movie/movieApi";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TvManageSource({
  movieId: _movieId,
  info,
}: {
  movieId: string;
  info: MovieDetail;
}) {
  const [getUploadUrl] = useGetCloudflareUploadUrlMutation();
  const [busyEp, setBusyEp] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: detail } = useGetMovieDetailQuery(_movieId);
  void _movieId;

  const handleUploadEpisode = async (file: File | undefined, epKey: string) => {
    if (!file) return;
    setBusyEp(epKey);
    try {
      const { uploadUrl, videoKey } = await getUploadUrl({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      }).unwrap();
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      toast.success(`Uploaded episode source (key: ${videoKey})`);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setBusyEp(null);
    }
  };

  const seasons = detail?.seasons || [];

  return (
    <section className="mx-auto max-w-4xl pb-20">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-extrabold text-white">
          Source Manager (TV)
        </h1>
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

        <Accordion type="single" collapsible className="w-full">
          {seasons.length === 0 && (
            <p className="text-sm text-zinc-400">No seasons</p>
          )}
          {seasons.map((s) => (
            <AccordionItem
              key={s.id || s.seasonNumber}
              value={`season-${s.id || s.seasonNumber}`}
            >
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-white">Season {s.seasonNumber}</span>
                  {s.title && (
                    <span className="text-xs text-zinc-400">- {s.title}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {(s.episodes || []).length === 0 && (
                    <p className="text-sm text-zinc-400">No episodes</p>
                  )}
                  {(s.episodes || []).map((ep) => {
                    const epKey = `${s.seasonNumber}-${ep.episodeNumber}`;
                    return (
                      <div
                        key={epKey}
                        className="rounded border border-zinc-800 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-white">
                            Episode {ep.episodeNumber}: {ep.title}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {ep.duration ? `${ep.duration} min` : ""}
                          </div>
                        </div>
                        <div className="mt-2 space-y-2">
                          <Label className="text-zinc-200">
                            Upload episode source
                          </Label>
                          <Input
                            type="file"
                            accept="video/*"
                            disabled={busyEp === epKey}
                            onChange={(e) =>
                              handleUploadEpisode(e.target.files?.[0], epKey)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
