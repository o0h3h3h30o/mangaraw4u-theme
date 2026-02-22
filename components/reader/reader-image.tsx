"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ReaderImageProps {
  src: string;
  alt: string;
  index: number;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

export function ReaderImage({
  src,
  alt,
  index,
  className,
  style,
  onLoad,
}: ReaderImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={cn(
        "relative w-full",
        isLoading ? "min-h-[50vh]" : "min-h-0",
        className
      )}
      style={style}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      )}

      {hasError ? (
        <div className="flex h-96 w-full flex-col items-center justify-center bg-muted p-4 text-center">
          <p className="text-muted-foreground">
            Failed to load image {index + 1}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              setHasError(false);
            }}
            className="mt-2 text-primary underline"
          >
            Retry
          </button>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "h-auto w-full block transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
