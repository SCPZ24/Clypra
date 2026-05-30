import React, { useState, useEffect, useRef } from "react";
import { TemplateDefinition, TemplateCustomization } from "./types";
import { LottiePlayer, LottiePlayerHandle } from "./LottiePlayer";
import { injectText, injectColor } from "./TemplateInjector";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ClypraApi } from "@/features/text-effects/api/clypraApi";
import { ALL_TEMPLATES } from "./templates/index";

interface TemplatePreviewProps {
  template: TemplateDefinition;
  onBack: () => void;
  onAddToTimeline: (template: TemplateDefinition, customization: TemplateCustomization) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onBack, onAddToTimeline }) => {
  const lottieRef = useRef<LottiePlayerHandle>(null);
  
  // Local customization state
  const [customization, setCustomization] = useState<TemplateCustomization>({
    primaryText: template.textLayers.find(l => l.role === 'primary')?.defaultText || "Custom Text",
    secondaryText: template.textLayers.find(l => l.role === 'secondary')?.defaultText || "",
    accentText: template.textLayers.find(l => l.role === 'accent')?.defaultText || "",
    primaryColor: "#FFFFFF"
  });

  const [lottieData, setLottieData] = useState<any>(template.lottieData);
  const [isLoadingLottie, setIsLoadingLottie] = useState(!template.lottieData);
  const [injectedData, setInjectedData] = useState<any>(template.lottieData);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dynamic on-demand Lottie JSON fetching if missing
  useEffect(() => {
    if (!template.lottieData) {
      setIsLoadingLottie(true);
      ClypraApi.getLottieTemplate(template.category, template.id)
        .then((data) => {
          setLottieData(data);
          setIsLoadingLottie(false);
        })
        .catch((err) => {
          console.warn("[Clypra:TemplatePreview] Failed to fetch Lottie JSON from local API, utilizing offline fallback:", err);
          const fallback = ALL_TEMPLATES.find((t) => t.id === template.id);
          if (fallback && fallback.lottieData) {
            setLottieData(fallback.lottieData);
          }
          setIsLoadingLottie(false);
        });
    } else {
      setLottieData(template.lottieData);
      setIsLoadingLottie(false);
    }
  }, [template]);

  // Debounced injection
  useEffect(() => {
    if (!lottieData) return;
    setIsUpdating(true);
    const timer = setTimeout(() => {
      let newData = injectText(lottieData, customization, template.textLayers);
      if (customization.primaryColor) {
        newData = injectColor(newData, "primary-fill-layer", customization.primaryColor); // Generic fill layer name convention
      }
      setInjectedData(newData);
      setIsUpdating(false);

      // Update the main preview with the latest injected data
      useUIStore.getState().previewTextPreset({
        ...template,
        presetType: "template",
        injectedData: newData
      }, "template");

      lottieRef.current?.goToFrame(0);
      lottieRef.current?.play();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [customization, lottieData, template.textLayers, template]);

  const handleTextChange = (role: 'primary' | 'secondary' | 'accent', value: string) => {
    setCustomization(prev => ({
      ...prev,
      [`${role}Text`]: value
    }));
  };

  const renderInputForRole = (role: 'primary' | 'secondary' | 'accent') => {
    const layerDef = template.textLayers.find(l => l.role === role);
    if (!layerDef) return null;

    const currentValue = (customization as any)[`${role}Text`] as string;
    const isNearLimit = currentValue.length >= (layerDef.maxCharacters - 5);
    const isOverLimit = currentValue.length > layerDef.maxCharacters;

    return (
      <div key={role} className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-text-muted">
          <span>{layerDef.layerName.replace(/-/g, ' ')}</span>
          <span className={`${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-text-muted/60'}`}>
            {currentValue.length} / {layerDef.maxCharacters}
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleTextChange(role, e.target.value)}
            placeholder={layerDef.defaultText}
            className={`w-full bg-surface-raised border ${isOverLimit ? 'border-red-500/50' : 'border-border'} rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-accent transition-colors`}
          />
          {isOverLimit && (
            <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface/5">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50 shrink-0 bg-surface/10">
        <button onClick={onBack} className="p-1.5 hover:bg-surface-raised rounded-md transition-colors text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-primary">{template.name}</span>
          <span className="text-[10px] text-text-muted capitalize">{template.category}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoadingLottie ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3 bg-surface-raised/40 border border-border/30 rounded-xl p-4">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <span className="text-xs text-text-muted font-medium">Fetching animation from API...</span>
          </div>
        ) : (
          <>
            {/* Input Editor Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-text-primary border-b border-border/30 pb-2">Customization</h4>
              
              <div className="space-y-4">
                {renderInputForRole('primary')}
                {renderInputForRole('secondary')}
                {renderInputForRole('accent')}
              </div>
            </div>

            <div className="pt-4 border-t border-border/30">
              <Button 
                onClick={() => onAddToTimeline(template, customization)}
                className="w-full py-2.5 bg-accent hover:bg-accent/80 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(108,99,255,0.2)] rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add to Timeline
              </Button>
              <p className="text-[9px] text-center text-text-muted mt-3">
                Duration: {(template.durationFrames / template.fps).toFixed(1)}s ({template.durationFrames} frames)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
