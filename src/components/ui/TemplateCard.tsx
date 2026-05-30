import React, { useRef, useState, useEffect } from "react";
import { TemplateDefinition } from "@/features/text-templates/types";
import { Download, Star } from "lucide-react";
import { LottiePlayer, LottiePlayerHandle } from "@/features/text-templates/LottiePlayer";

interface TemplateCardProps {
  template: TemplateDefinition;
  isFavorite: boolean;
  isDownloading: boolean;
  onFavorite: (e: React.MouseEvent) => void;
  onApply: (e: React.MouseEvent) => void;
  onPreview: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  isDownloading,
  onFavorite,
  onApply,
  onPreview,
}) => {
  const lottieRef = useRef<LottiePlayerHandle>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Always autoplay and loop without hover requirements
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  // Handle high-performance off-React timeline progress bar update (60fps)
  const handleFrameChange = (currentFrame: number, totalFrames: number) => {
    if (progressBarRef.current) {
      const percentage = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;
      progressBarRef.current.style.width = `${percentage}%`;
    }
  };

  // Initial calculation for static mounting percentage
  const initPercentage =
    template.durationFrames && template.durationFrames > 0
      ? ((template.thumbnailFrame || 0) / template.durationFrames) * 100
      : 0;

  return (
    <div
      onClick={onPreview}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full aspect-video bg-surface-raised/10 hover:bg-surface-raised/20 border border-border/30 hover:border-accent/40 rounded-xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 group cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.15)]"
    >
      {/* Favorite Star Button (hover show or active) */}
      <button
        onClick={onFavorite}
        className={`absolute top-2 right-2 p-1.5 cursor-pointer rounded-full bg-black/60 hover:bg-black/80 border border-white/5 text-white/70 hover:text-white transition-all duration-300 z-10 pointer-events-auto ${
          isFavorite
            ? "opacity-100 text-yellow-400!"
            : "opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-yellow-400 text-yellow-400!" : ""}`} />
      </button>

      {/* Lottie Preview Container - Scales up subtly on hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
        <LottiePlayer
          ref={lottieRef}
          lottieData={template.lottieData}
          autoplay={true}
          loop={true}
          initialFrame={template.thumbnailFrame || 0}
          onFrameChange={handleFrameChange}
          className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Footer Info / Apply Download Button */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-linear-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[10px] text-white font-semibold tracking-wide truncate drop-shadow-md pr-4">
          {template.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply(e);
          }}
          className="w-6 h-6 rounded-full bg-accent hover:bg-accent/80 border border-white/10 flex items-center justify-center text-white transition-all duration-300 relative cursor-pointer shadow-lg pointer-events-auto group/btn"
        >
          {isDownloading ? (
            <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
          ) : (
            <Download className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Sleek, Off-React Timeline Playback Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden z-20 pointer-events-none">
        <div
          ref={progressBarRef}
          style={{ width: `${initPercentage}%` }}
          className="h-full bg-linear-to-r from-accent to-accent-soft rounded-r-full transition-[width] duration-75 ease-out shadow-[0_0_8px_rgba(139,92,246,0.8)]"
        />
      </div>
    </div>
  );
};
