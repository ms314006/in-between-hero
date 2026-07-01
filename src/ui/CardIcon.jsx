import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PxlKitIcon, animatedToFrameIcons, gridToSvg, isAnimatedIcon } from "@pxlkit/core";
import { CARD_ICONS, DEFAULT_CARD_ICON } from "./cardIcons.js";

function svgInner(svg) {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}

function renderSeamlessAnimatedSvg(icon) {
  const frames = animatedToFrameIcons(icon);
  const frameCount = frames.length;
  if (!frameCount) return "";

  const duration = frameCount * icon.frameDuration;
  const animationName = `card-icon-${icon.name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const styles = frames.map((_, index) => {
    const start = (index / frameCount) * 100;
    const end = ((index + 1) / frameCount) * 100;
    const beforeStart = Math.max(start - 0.001, 0);
    const beforeEnd = Math.max(end - 0.001, start);

    if (index === 0) {
      return `@keyframes ${animationName}-${index}{0%,${beforeEnd}%{opacity:1}${end}%,100%{opacity:0}}`;
    }

    if (index === frameCount - 1) {
      return `@keyframes ${animationName}-${index}{0%,${beforeStart}%{opacity:0}${start}%,100%{opacity:1}}`;
    }

    return `@keyframes ${animationName}-${index}{0%,${beforeStart}%{opacity:0}${start}%,${beforeEnd}%{opacity:1}${end}%,100%{opacity:0}}`;
  }).join("");

  const frameGroups = frames.map((frame, index) => {
    const frameSvg = gridToSvg(frame, { mode: "colorful" });
    return `<g style="animation:${animationName}-${index} ${duration}ms linear infinite both">${svgInner(frameSvg)}</g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.size} ${icon.size}" shape-rendering="crispEdges" fill="none"><style>${styles}</style>${frameGroups}</svg>`;
}

export function CardIcon({ id, className = "collection-card-icon", size = 160 }) {
  const iconConfig = CARD_ICONS[id] ?? DEFAULT_CARD_ICON;
  const icon = iconConfig.icon ?? iconConfig;

  if (isAnimatedIcon(icon)) {
    return <span className={`${className} animated`} dangerouslySetInnerHTML={{ __html: renderSeamlessAnimatedSvg(icon) }} />;
  }

  return <PxlKitIcon icon={icon} size={size} colorful className={className} />;
}

export function renderIconMarkup(icon, { className, size = 32 } = {}) {
  if (isAnimatedIcon(icon)) {
    return `<span class="${className ?? "pxl-icon"} animated">${renderSeamlessAnimatedSvg(icon)}</span>`;
  }

  return renderToStaticMarkup(createElement(PxlKitIcon, {
    icon,
    size,
    colorful: true,
    className
  }));
}
