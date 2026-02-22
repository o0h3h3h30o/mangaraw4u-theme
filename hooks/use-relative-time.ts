"use client";

import { useEffect, useState } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";

interface UseRelativeTimeOptions {
  updateInterval?: number;
  locale?: string;
}

export function useRelativeTime(
  timestamp: string | Date,
  options: UseRelativeTimeOptions = {}
) {
  const { updateInterval = 60000, locale = DEFAULT_LOCALE } = options;
  const [relativeTime, setRelativeTime] = useState<string>("");

  useEffect(() => {
    const updateRelativeTime = () => {
      try {
        const date = new Date(timestamp);
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
        const diff = Date.now() - date.getTime();

        if (isNaN(date.getTime()) || diff < 0) {
          setRelativeTime("unknown time");
          return;
        }

        const seconds = Math.round(diff / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        const months = Math.round(days / 30);
        const years = Math.round(months / 12);

        if (years > 0) {
          setRelativeTime(rtf.format(-years, "year"));
        } else if (months > 0) {
          setRelativeTime(rtf.format(-months, "month"));
        } else if (days > 0) {
          setRelativeTime(rtf.format(-days, "day"));
        } else if (hours > 0) {
          setRelativeTime(rtf.format(-hours, "hour"));
        } else if (minutes > 0) {
          setRelativeTime(rtf.format(-minutes, "minute"));
        } else {
          setRelativeTime(rtf.format(-seconds, "second"));
        }
      } catch (error) {
        console.error("Error calculating relative time:", error);
        setRelativeTime("unknown time");
      }
    };

    updateRelativeTime();

    if (updateInterval > 0) {
      const interval = setInterval(updateRelativeTime, updateInterval);
      return () => clearInterval(interval);
    }
  }, [timestamp, locale, updateInterval]);

  return relativeTime;
}
