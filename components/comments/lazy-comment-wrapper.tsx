"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { CommentsSkeleton } from "./comments-skeleton";

interface LazyCommentWrapperProps {
  children: ReactNode;
  rootMargin?: string;
}

/**
 * LazyCommentWrapper - Viewport-based lazy loading for comment sections
 *
 * Defers rendering children until component enters viewport using Intersection Observer.
 * Maximizes performance by avoiding JS downloads for users who never scroll to comments.
 *
 * @param children - Content to render when visible (typically CommentSection)
 * @param rootMargin - Distance before viewport to trigger load (default: "200px")
 *
 * @example
 * <LazyCommentWrapper>
 *   <CommentSection {...props} />
 * </LazyCommentWrapper>
 */
export function LazyCommentWrapper({
  children,
  rootMargin = "200px",
}: LazyCommentWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect(); // One-time load, no performance overhead
        }
      },
      { rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect(); // Cleanup on unmount
  }, [rootMargin]);

  return (
    <div ref={ref} className="min-h-[200px]">
      {shouldRender ? children : <CommentsSkeleton />}
    </div>
  );
}
