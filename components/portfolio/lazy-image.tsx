"use client";

import React, { useState, useEffect } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export default function LazyImage({ src, alt, className = "", ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset state if the source tracking handle changes dynamically
    setIsLoaded(false);

    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
      {/* 1. Placeholder Layer */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 h-full w-full animate-pulse bg-portfolio-glow transition-opacity duration-500 ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        />
      )}

      {/* 2. Target Production Asset Layer */}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-200 ease-out will-change-[opacity] ${className} ${isLoaded ? "opacity-100" : "opacity-0"
            }`}
          {...props}
        />
      )}
    </div>
  );
}