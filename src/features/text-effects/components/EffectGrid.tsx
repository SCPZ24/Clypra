import { useState, useEffect } from "react";
import { useEffectsStore } from "../store/effectsStore";
import { EffectCard } from "@/components/ui/EffectCard";
import { ClypraApi } from "../api/clypraApi";
import type { TextEffectDefinition } from "../types/types";

const CATEGORIES = ["3d", "neon", "metallic", "glitch", "retro", "gradient", "grunge", "outline", "shadow", "elements", "luxury"];

interface EffectGridProps {
  searchQuery?: string;
}

export function EffectGrid({ searchQuery = "" }: EffectGridProps) {
  const [activeCategory, setActiveCategory] = useState("3d");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const { index, indexLoading, indexError, loadCategory, selectEffect } = useEffectsStore();

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("clypra_text_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load downloaded effects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("clypra_downloaded_effects");
    if (saved) {
      try {
        const downloaded = JSON.parse(saved);
        setDownloadedIds(new Set(downloaded));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load index when category changes
  useEffect(() => {
    loadCategory(activeCategory);
  }, [activeCategory, loadCategory]);

  const items = index[activeCategory] ?? [];
  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = favorites.includes(id) ? favorites.filter((favId) => favId !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("clypra_text_favorites", JSON.stringify(next));
  };

  const handleDownloadAndApply = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemId = item.id;
    if (downloadingIds.has(itemId)) return;

    setDownloadingIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    // Lazy load the full effect definition
    try {
      const fullEffect = await ClypraApi.getFullEffect(item.category, item.id);

      setTimeout(() => {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });

        // Mark as downloaded
        setDownloadedIds((prev) => {
          const next = new Set(prev);
          next.add(itemId);
          // Save to localStorage
          localStorage.setItem("clypra_downloaded_effects", JSON.stringify(Array.from(next)));
          return next;
        });

        // TODO: Add to timeline functionality
        console.log("Apply effect to timeline:", fullEffect);
      }, 850);
    } catch (err) {
      console.error("[EffectGrid] Failed to load effect:", err);
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handlePreview = async (item: any) => {
    selectEffect(item.id, item.category);
  };

  // Convert EffectIndexItem to TextEffectDefinition for the UI component
  const convertToEffectDefinition = (item: any): TextEffectDefinition => {
    return {
      ...item,
      text: "CLYPRA",
      description: item.description || "",
      tags: item.tags || [],
      font: {
        family: "Inter",
        weight: 700,
        style: "normal",
        letterSpacing: 0,
        lineHeight: 1.2,
      },
      fills: [],
      strokes: [],
      shadows: [],
    };
  };

  return (
    <div className="flex flex-col h-full bg-surface/5">
      {/* ── Category tabs ───────────────────────────────────── */}
      <div className="relative shrink-0 border-b border-border/40 bg-surface/5">
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-linear-to-l to-surface from-transparent pointer-events-none" />
        <div className="flex overflow-x-auto gap-2 p-1 whitespace-nowrap" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2 py-1 capitalize text-xs font-medium rounded-sm transition-colors cursor-pointer hover:bg-accent/10 hover:text-accent ${activeCategory === cat ? "bg-accent/10 text-accent" : "text-text-muted"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-linear-to-l from-surface to-transparent pointer-events-none" />
      </div>

      {/* ── Grid body ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        {indexLoading && <GridSkeleton />}

        {indexError && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-sm text-text-muted">{indexError}</p>
            <button onClick={() => loadCategory(activeCategory)} className="text-xs text-accent underline cursor-pointer hover:text-accent-soft">
              Retry
            </button>
          </div>
        )}

        {!indexLoading && !indexError && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-1 text-xs text-text-muted">
            <p>No matching effects found</p>
            <p className="opacity-60">Try searching for other styles</p>
          </div>
        )}

        {!indexLoading && !indexError && filteredItems.length > 0 && (
          <div className="grid grid-cols-3 gap-1">
            {filteredItems.map((effect) => (
              <EffectCard key={effect.id} effect={convertToEffectDefinition(effect)} isFavorite={favorites.includes(effect.id)} isDownloading={downloadingIds.has(effect.id)} isDownloaded={downloadedIds.has(effect.id)} onFavorite={(e) => toggleFavorite(effect.id, e)} onApply={(e) => handleDownloadAndApply(effect, e)} onPreview={() => handlePreview(effect)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white/5 animate-pulse aspect-square" style={{ animationDelay: `${i * 45}ms` }} />
      ))}
    </div>
  );
}
