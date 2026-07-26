import type { CSSProperties } from "react";
import type { PortalCustomElement } from "../content/portal";
import type { EditableBlockStyle, StoryImageAsset } from "../content/story";

type VariableStyle = CSSProperties & Record<`--${string}`, string | number | undefined>;

export function portalTextStyle(style?: EditableBlockStyle): VariableStyle | undefined {
  if (!style) return undefined;
  return {
    "--portal-desktop-font-size": style.fontSize ? `${style.fontSize}px` : undefined,
    "--portal-mobile-font-size": style.mobileFontSize ? `${style.mobileFontSize}px` : undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    color: style.color,
    textAlign: style.textAlign,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    maxWidth: style.maxWidth ? `${style.maxWidth}px` : undefined,
    marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : undefined,
    marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : undefined,
    padding: style.padding !== undefined ? `${style.padding}px` : undefined,
    backgroundColor: style.backgroundColor,
    border: style.borderColor ? `1px solid ${style.borderColor}` : undefined,
    borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : undefined,
  };
}

function imageStyle(image: StoryImageAsset): CSSProperties {
  return {
    aspectRatio: `${image.width}/${image.height}`,
    width: `${image.displayWidth ?? 100}%`,
    maxWidth: image.maxWidth ? `${image.maxWidth}px` : undefined,
    marginLeft: image.alignment === "left" ? 0 : "auto",
    marginRight: image.alignment === "right" ? 0 : "auto",
    borderRadius: image.borderRadius ? `${image.borderRadius}px` : undefined,
    objectFit: image.objectFit ?? "contain",
  };
}

export function PortalElements({ elements, className = "" }: { elements?: PortalCustomElement[]; className?: string }) {
  if (!elements?.length) return null;
  const eagerImages = className.split(/\s+/).includes("portal-entry-elements");
  return <section className={`portal-custom-elements ${className}`.trim()}>
    {elements.map((element) => element.type === "text"
      ? <div key={element.id} className="portal-custom-element portal-custom-text portal-styled-text" style={portalTextStyle(element.style)}>{element.text}</div>
      : <figure key={element.id} className="portal-custom-element portal-custom-image"><img src={element.image.src} alt={element.image.alt} width={element.image.width} height={element.image.height} loading={eagerImages ? "eager" : "lazy"} fetchPriority={eagerImages ? "high" : "auto"} decoding="async" style={imageStyle(element.image)} /></figure>)}
  </section>;
}
