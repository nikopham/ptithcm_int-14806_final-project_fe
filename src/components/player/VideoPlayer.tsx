import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { useSaveProgressMutation } from "@/features/movie/movieApi";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  movieId: string;
  episodeId?: string;
}

export const VideoPlayer = ({ src,movieId, episodeId, poster, className }: VideoPlayerProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const [saveProgress] = useSaveProgressMutation();
  console.log(movieId);
  

  const lastUpdateRef = useRef<number>(0);
  const saveProgressRef = useRef(saveProgress);
  const movieIdRef = useRef(movieId);
  const episodeIdRef = useRef(episodeId);

  // Keep refs updated
  useEffect(() => {
    saveProgressRef.current = saveProgress;
    movieIdRef.current = movieId;
    episodeIdRef.current = episodeId;
  }, [saveProgress, movieId, episodeId]);

  useEffect(() => {
    if (!artRef.current) return;
    
    // Tránh tạo nhiều instance cùng lúc
    if (isInitializingRef.current) {
      return;
    }

    const container = artRef.current;
    let art: Artplayer | null = null;

    // Destroy instance cũ trước khi tạo mới
    if (playerRef.current) {
      try {
        playerRef.current.destroy(false);
      } catch (error) {
        // Ignore errors during cleanup
        console.warn("Error destroying previous player instance:", error);
      }
      playerRef.current = null;
    }

    // Clear container để đảm bảo không có element nào còn lại
    if (container) {
      container.innerHTML = '';
    }

    isInitializingRef.current = true;

    // Đợi một chút để đảm bảo DOM đã được clear hoàn toàn
    const timeoutId = setTimeout(() => {
      if (!container || container !== artRef.current) {
        isInitializingRef.current = false;
        return;
      }

      try {
        art = new Artplayer({
          container: container,
      url: src,
      poster: poster,
      volume: 0.5,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: "#23ade5",
      customType: {
        m3u8: function (
          video: HTMLMediaElement,
          url: string,
          artInstance: Artplayer
        ) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              const levels = hls.levels.map((level, index) => ({
                html:
                  (level.height || level.bitrate || `Level ${index}`) +
                  (level.height ? "p" : ""),
                level: index,
                default: false,
              }));

              levels.unshift({
                html: "Auto",
                level: -1,
                default: true,
              });

              artInstance.controls.add({
                name: "quality",
                index: 20,
                position: "right",
                style: { marginRight: "10px" },
                html: "Auto",
                selector: levels,
                onSelect: (item: any) => {
                  hls.currentLevel = item.level;
                  return item.html;
                },
              });

              // Auto play when manifest is ready
              if (artInstance.video) {
                artInstance.play().catch(() => {
                  // Autoplay may be blocked, user can click play manually
                });
              }
            });

            artInstance.on("destroy", () => hls.destroy());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            // Auto play for native HLS support
            video.play().catch(() => {
              // Autoplay may be blocked, user can click play manually
            });
          } else {
            artInstance.notice.show =
              "Unsupported playback format: m3u8" as any;
          }
        },
      },
    });

    const handleSave = async (currentTime: number, duration: number) => {
      // Chỉ gửi nếu duration hợp lệ
      if (!duration || duration <= 0) return;

      try {
        await saveProgressRef.current({
          movieId: movieIdRef.current,
          episodeId: episodeIdRef.current || null,
          watchedSeconds: Math.floor(currentTime),
          totalSeconds: Math.floor(duration)
        }).unwrap();
      } catch (error) {
        // Silently fail - this is background saving, don't interrupt user experience
        console.error("Failed to save progress:", error);
      }
    };

    // 2. Lắng nghe sự kiện timeupdate (Video đang chạy)
    art.on('video:timeupdate', () => {
      const currentTime = art.video.currentTime;
      const duration = art.video.duration;

      // Cứ mỗi 15 giây gửi API một lần (Throttling)
      if (currentTime - lastUpdateRef.current > 15) {
        handleSave(currentTime, duration);
        lastUpdateRef.current = currentTime;
      }
    });

    // Hook vào Artplayer's pause method để đảm bảo video được pause
    const originalPause = art.pause.bind(art);
    art.pause = function() {
      const result = originalPause();
      // Đảm bảo video element thực sự bị pause
      if (art.video && !art.video.paused) {
        art.video.pause();
      }
      return result;
    };

    // 3. Gửi ngay lập tức khi Pause và đảm bảo video được pause
    art.on('pause', () => {
      // Đảm bảo video element thực sự bị pause (force pause)
      if (art.video) {
        if (!art.video.paused) {
          art.video.pause();
        }
        handleSave(art.video.currentTime, art.video.duration);
      }
    });

    // Lắng nghe video pause event trực tiếp từ video element
    art.on('ready', () => {
      art.play().catch(() => {
        // Autoplay may be blocked by browser, user can click play manually
      });

      // Lắng nghe trực tiếp video element pause event để đảm bảo video được pause
      if (art.video) {
        const handleVideoPause = () => {
          // Đảm bảo video thực sự bị pause
          if (!art.video.paused) {
            art.video.pause();
          }
        };

        art.video.addEventListener('pause', handleVideoPause);
        
        // Cleanup listener khi destroy
        art.on('destroy', () => {
          art.video?.removeEventListener('pause', handleVideoPause);
        });
      }
    });
    
        // 4. Gửi ngay lập tức khi Hủy/Đóng (Destroy)
        art.on('destroy', () => {
          if (art.video) {
            handleSave(art.video.currentTime, art.video.duration);
          }
        });

        playerRef.current = art;
        isInitializingRef.current = false;
      } catch (error) {
        console.error("Error creating Artplayer instance:", error);
        isInitializingRef.current = false;
      }
    }, 100); // Small delay to ensure DOM is clean

    return () => {
      clearTimeout(timeoutId);
      isInitializingRef.current = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy(false);
        } catch (error) {
          console.warn("Error destroying player instance on cleanup:", error);
        }
        playerRef.current = null;
      }
      // Clear container khi cleanup
      if (artRef.current) {
        artRef.current.innerHTML = '';
      }
    };
  }, [src, movieId, episodeId, poster]);

  return (
    <div
      ref={artRef}
      className={`w-full aspect-video bg-black ${className || ""}`}
    />
  );
};

export default VideoPlayer;
