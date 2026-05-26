import { TextEffectDefinition } from "./types";
import { applyFontConfig } from "./helpers";

/**
 * Procedural Canvas 2D Neon Yellow Outline premium text renderer.
 * White body, crisp black stroke, and dual radiating yellow bloom glows.
 * Renders glows using modern hardware-accelerated Canvas context blurs to bypass WebKit native text shadow clipping.
 */
export const renderNeonYellowOutline = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, text: string, effect: TextEffectDefinition, fontSize: number, x: number, y: number, canvasWidth: number, canvasHeight: number, lines: string[], lineHeightPx: number, textWidth: number, textHeight: number) => {
  if (!effect.neonYellowOutline || !effect.neonYellowOutline.enabled) return;
  const config = effect.neonYellowOutline;

  applyFontConfig(ctx, effect.font, fontSize);

  // Phase 1: Draw Wide Outer Glow (soft diffused halo)
  ctx.save();
  ctx.globalAlpha = 0.5;
  (ctx as any).filter = `blur(${config.glowWideBlur}px)`;

  lines.forEach((line, index) => {
    const lineY = y - ((lines.length - 1) * lineHeightPx) / 2 + index * lineHeightPx;

    ctx.strokeStyle = config.glowColor;
    ctx.lineWidth = config.strokeWidth * 4.5;
    ctx.lineJoin = "round";
    ctx.strokeText(line, x, lineY);
  });
  ctx.restore();

  // Phase 2: Draw Medium Glow (middle transition)
  ctx.save();
  ctx.globalAlpha = 0.6;
  (ctx as any).filter = `blur(${Math.floor(config.glowWideBlur * 0.6)}px)`;

  lines.forEach((line, index) => {
    const lineY = y - ((lines.length - 1) * lineHeightPx) / 2 + index * lineHeightPx;

    ctx.strokeStyle = config.glowColor;
    ctx.lineWidth = config.strokeWidth * 3.5;
    ctx.lineJoin = "round";
    ctx.strokeText(line, x, lineY);
  });
  ctx.restore();

  // Phase 3: Draw Tight Inner Glow (just outside black stroke)
  ctx.save();
  ctx.globalAlpha = 0.5;
  (ctx as any).filter = `blur(${config.glowTightBlur}px)`;

  lines.forEach((line, index) => {
    const lineY = y - ((lines.length - 1) * lineHeightPx) / 2 + index * lineHeightPx;

    ctx.strokeStyle = config.glowColor;
    ctx.lineWidth = config.strokeWidth * 2.5;
    ctx.lineJoin = "round";
    ctx.strokeText(line, x, lineY);
  });
  ctx.restore();

  // Phase 4: Draw Crisp Black Outside Stroke
  ctx.save();
  ctx.strokeStyle = config.strokeColor;
  ctx.lineWidth = config.strokeWidth * 2;
  ctx.lineJoin = "round";
  ctx.globalAlpha = 1.0;
  lines.forEach((line, index) => {
    const lineY = y - ((lines.length - 1) * lineHeightPx) / 2 + index * lineHeightPx;
    ctx.strokeText(line, x, lineY);
  });
  ctx.restore();

  // Phase 5: Draw White Text Body Fill
  ctx.save();
  ctx.fillStyle = config.fillColor;
  lines.forEach((line, index) => {
    const lineY = y - ((lines.length - 1) * lineHeightPx) / 2 + index * lineHeightPx;
    ctx.fillText(line, x, lineY);
  });
  ctx.restore();
};
