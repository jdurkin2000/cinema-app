"use client";

import React, { useEffect, useState } from "react";
import NextImage from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>;

const PLACEHOLDER = "/poster_loading.png";

function isAllowed(src?: string | null) {
  if (!src) return false;
  return (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}

export default function ValidatedImage({
  src,
  alt,
  width,
  height,
  className,
  ...rest
}: Props) {
  const [currentSrc, setCurrentSrc] = useState<string>(() =>
    isAllowed(src) ? (src as string) : PLACEHOLDER
  );

  useEffect(() => {
    setCurrentSrc(isAllowed(src) ? (src as string) : PLACEHOLDER);
  }, [src]);

  const handleError = () => setCurrentSrc(PLACEHOLDER);

  // If width and height supplied, prefer Next/Image for optimization
  if (typeof width === "number" && typeof height === "number") {
    return (
      <NextImage
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        {...(rest as any)}
      />
    );
  }

  // Fallback to a plain <img> when dimensions aren't provided
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}
