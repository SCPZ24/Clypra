import { type TextTemplatePreset } from "@/constants/textTemplates";

import { Download, Sparkles, Star } from "lucide-react";

interface TemplateCardProps {
  template: TextTemplatePreset;
  isFavorite: boolean;
  isDownloading: boolean;
  onFavorite: (e: React.MouseEvent) => void;
  onApply: (e: React.MouseEvent) => void;
  onPreview: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, isFavorite, isDownloading, onFavorite, onApply, onPreview }) => {
  // Render miniature template layouts dynamically
  const renderMiniOverlay = () => {
    switch (template.overlayType) {
      case "pin":
        return (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/50 border border-white/10 rounded-full text-[8px] text-white select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="font-semibold tracking-wide truncate max-w-[50px]">LA</span>
          </div>
        );
      case "neon":
        return <div className="px-1.5 py-0.5 bg-black/30 border border-pink-500 rounded text-[8px] text-pink-400 font-bold tracking-wider animate-pulse uppercase select-none">NEON</div>;
      case "terminal":
        return (
          <div className="w-full px-1.5 py-0.5 bg-black border border-emerald-500/30 rounded font-mono text-[8px] text-emerald-400 flex items-center gap-0.5 select-none">
            <span className="text-emerald-500 font-bold">&gt;</span>
            <span className="truncate">sh</span>
            <span className="w-1 h-2 bg-emerald-400 animate-pulse shrink-0" />
          </div>
        );
      case "news":
        return (
          <div className="w-full flex flex-col font-mono text-[8px] select-none">
            <div className="bg-red-600 px-1 py-0.2 text-white font-bold text-center tracking-widest leading-none">ALERT</div>
            <div className="bg-neutral-800 px-1 py-0.2 text-zinc-300 truncate tracking-tight text-center leading-none">BREAKING</div>
          </div>
        );
      case "viewfinder":
        return (
          <div className="absolute inset-1.5 border border-white/15 rounded flex flex-col justify-between p-0.5 select-none pointer-events-none">
            <div className="flex justify-between items-center text-[5px] text-red-500 font-bold tracking-wider uppercase font-mono">
              <span className="flex items-center gap-0.2">
                <span className="w-0.8 h-0.8 rounded-full bg-red-600 animate-pulse" />
                REC
              </span>
              <span>HD</span>
            </div>
            <div className="text-[5px] text-white/40 text-right font-mono">00:04</div>
          </div>
        );
      case "social":
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 border border-blue-500 rounded text-[8px] text-white select-none">
            <span className="font-semibold truncate">Follow</span>
          </div>
        );
      case "divider":
        return (
          <div className="w-full flex items-center justify-center gap-1 select-none">
            <span className="grow h-px bg-white/20" />
            <span className="text-[7px] text-white/50 font-mono tracking-widest">CHAPTER</span>
            <span className="grow h-px bg-white/20" />
          </div>
        );
      case "quote":
        return (
          <div className="flex flex-col items-center justify-center relative px-1 select-none">
            <span className="text-lg font-bold font-serif text-white/30 leading-none">“</span>
            <span className="text-[8px] text-zinc-400 italic text-center font-serif truncate max-w-[65px]">Life is short</span>
          </div>
        );
      case "health":
        return (
          <div className="flex flex-col gap-0.5 w-full max-w-[65px] bg-black/40 border border-white/5 p-0.5 rounded select-none">
            <div className="text-[6px] text-zinc-400 font-bold truncate font-mono">HP</div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-emerald-500" />
            </div>
          </div>
        );
      case "hud":
        return (
          <div className="w-14 h-7 border border-[#00c8ff]/30 rounded relative flex items-center justify-center select-none">
            <span className="text-[6px] text-[#00c8ff] font-mono tracking-wider animate-pulse">HUD ACTIVE</span>
          </div>
        );
      default:
        return (
          <div className="px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-[7px] text-accent-soft font-bold uppercase tracking-wider flex items-center gap-0.5 select-none">
            <Sparkles className="w-1.5 h-1.5 text-accent-soft" />
            Overlay
          </div>
        );
    }
  };

  return (
    <div onClick={onPreview} className="w-full aspect-square bg-surface-raised/40 hover:bg-surface-raised/80 border border-border/40 hover:border-accent/40 rounded-xl relative overflow-hidden flex flex-col justify-between p-2.5 transition-all duration-300 group cursor-pointer">
      {/* Favorite Star (hover show or active) */}
      <button onClick={onFavorite} className={`absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/5 text-white/70 hover:text-white transition-all duration-200 z-10 ${isFavorite ? "opacity-100 text-yellow-400!" : "opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"}`}>
        <Star className={`w-3 h-3 ${isFavorite ? "fill-yellow-400 text-yellow-400!" : ""}`} />
      </button>

      {/* Dynamic Miniature Preview Representation */}
      <div className="flex-1 flex flex-col items-center justify-center w-full gap-1.5 relative mt-3 select-none">
        {renderMiniOverlay()}
        <span className="text-[9px] text-zinc-300 font-bold tracking-tight text-center max-w-[80px] truncate leading-tight select-none">{template.name}</span>
      </div>

      {/* Footer Info / Apply Download Button */}
      <div className="flex items-center justify-between w-full mt-0.5 z-10">
        <span className="text-[9px] text-text-muted font-medium group-hover:text-text-primary transition-colors truncate max-w-[65px]">{template.name}</span>
        <button onClick={(e) => { e.stopPropagation(); onApply(e); }} className="w-5.5 h-5.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/5 flex items-center justify-center text-text-muted hover:text-text-primary transition-all relative cursor-pointer">{isDownloading ? <div className="w-3 h-3 rounded-full border border-accent border-t-transparent animate-spin" /> : <Download className="w-2.5 h-2.5 group-hover:scale-115 transition-transform" />}</button>
      </div>
    </div>
  );
};
