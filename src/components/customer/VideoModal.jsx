import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import ReactPlayer from "react-player";
import { useState, useEffect } from "react";

/**
 * props:
 *  open         : boolean
 *  onOpenChange : (bool)=>void
 *  videos       : [{ id, title, youtubeId, thumb }]
 */
export default function VideoModal({ open, onOpenChange, videos }) {
  const [current, setCurrent] = useState(videos[0]);

  // reset current khi mở modal mới
  useEffect(() => {
    if (videos?.length) setCurrent(videos[0]);
  }, [videos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    p-0
    w-[95vw]            sm:w-[95vw]
    max-w-[1600px]      sm:max-w-[1600px]
    overflow-hidden
  "
      >
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-lg line-clamp-2">
            {current.title}
          </DialogTitle>
        </DialogHeader>

        <div className="aspect-video w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Player */}
            <div className="col-span-1 md:col-span-2 bg-black flex items-center justify-center">
              <div className="aspect-video w-full h-full">
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${current.youtubeId}`}
                  width="100%"
                  height="100%"
                  controls
                  style={{ borderRadius: "0.5rem" }}
                />
              </div>
            </div>

            {/* Video list */}
            <ScrollArea className="p-4 bg-white">
              <div className="space-y-3">
                {videos.map((v) => {
                  const isActive = v.id === current.id;
                  return (
                    <Card
                      key={v.id}
                      onClick={() => setCurrent(v)}
                      className={`
    cursor-pointer transition
    ${
      isActive ? "bg-primary/10 shadow-inner" : "hover:bg-muted"
    }                       
  `}
                    >
                      <CardContent className="flex items-center space-x-3 p-2">
                        <img
                          src={v.thumb}
                          alt={v.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <span
                          className={`text-sm line-clamp-2 ${
                            isActive ? "font-semibold text-primary" : ""
                          }`}
                        >
                          {v.title}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
