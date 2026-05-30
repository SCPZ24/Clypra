// src/features/text-effects/api/clypraApi.ts
import { TextEffectDefinition } from "../types/types";
import { TemplateDefinition } from "@/features/text-templates/types";

export interface TextEffectSummary {
  id: string;
  name: string;
  category: string;
  tags: string[];
  thumbnail: string;
  description: string;
}

const BASE = "https://clypra-worker-api.abdulkabirmusa.com";

export const ClypraApi = {
  // In-memory cache map to avoid duplicate network calls when users toggle effects
  _effectsCache: new Map<string, TextEffectDefinition>(),
  _lottieCache: new Map<string, any>(),

  // 0. Checks if the API is online by hitting the health endpoint
  async checkApiHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === "ok";
    } catch (e) {
      return false;
    }
  },

  // 1. Fetch thin summaries for picker UI layout (Call once on startup, size is ~50KB)
  async getEffectsIndex(): Promise<TextEffectSummary[]> {
    const res = await fetch(`${BASE}/effects`);
    if (!res.ok) throw new Error("Failed to load text effects directory");
    return res.json();
  },

  // 2. Fetch thin summaries for category tab picker UI
  async getEffectsByCategory(category: string): Promise<TextEffectSummary[]> {
    const res = await fetch(`${BASE}/effects/${category}`);
    if (!res.ok) throw new Error(`Failed to load category manifest for: ${category}`);
    return res.json();
  },

  // 3. LAZY-LOAD heavy configurations on selection with RAM caching
  async getFullEffect(category: string, id: string): Promise<TextEffectDefinition> {
    const cacheKey = `${category}:${id}`;
    if (this._effectsCache.has(cacheKey)) {
      return this._effectsCache.get(cacheKey)!;
    }

    console.log(`[API] Fetching heavy configuration on-demand for effect: ${id}`);
    const res = await fetch(`${BASE}/effects/${category}/${id}`);
    if (!res.ok) throw new Error(`Failed to load heavy configuration for effect: ${id}`);

    const data: TextEffectDefinition = await res.json();
    this._effectsCache.set(cacheKey, data); // store in cache
    return data;
  },

  // 4. Fetch thin summaries for template manifest
  async getTemplatesIndex(): Promise<TemplateDefinition[]> {
    const res = await fetch(`${BASE}/templates`);
    if (!res.ok) throw new Error("Failed to load templates directory");
    return res.json();
  },

  // 5. LAZY-LOAD heavy Lottie animations on-timeline placement with RAM caching
  async getLottieTemplate(category: string, id: string): Promise<any> {
    const cacheKey = `${category}:${id}`;
    if (this._lottieCache.has(cacheKey)) {
      return this._lottieCache.get(cacheKey)!;
    }

    console.log(`[API] Fetching heavy Lottie vector data on-demand for template: ${id}`);
    const res = await fetch(`${BASE}/templates/${category}/${id}`);
    if (!res.ok) throw new Error(`Failed to load Lottie animation payload for: ${id}`);

    const data = await res.json();
    this._lottieCache.set(cacheKey, data); // store in cache
    return data;
  },
};

