"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CommentTab {
  id: string;
  label: string;
  count: number;
  content: React.ReactNode;
  disabled?: boolean;
}

interface CommentTabsProps {
  tabs: CommentTab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: "default" | "segmented";
  className?: string;
}

export function CommentTabs({
  tabs,
  defaultTab = tabs[0]?.id,
  onTabChange,
  variant = "default",
  className,
}: CommentTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabsListRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  // Update indicator position when tab changes
  useEffect(() => {
    if (!tabsListRef.current || variant !== "segmented") return;

    const activeTrigger = tabsListRef.current.querySelector(
      `[data-state="active"]`
    ) as HTMLElement;

    if (activeTrigger) {
      const { offsetLeft, offsetWidth } = activeTrigger;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeTab, variant]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Swipe detection for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1].id);
    }
    if (isRightSwipe && currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div
      className={cn("w-full", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="relative">
          <TabsList
            ref={tabsListRef}
            variant={variant}
            className={cn(
              "relative w-full",
              variant === "segmented" && "overflow-x-auto scrollbar-hide"
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                badge={tab.count}
                disabled={tab.disabled}
                className={cn(
                  "relative gap-2 data-[state=active]:shadow-sm min-h-[44px]",
                  // Mobile specific styles
                  "sm:min-h-[40px] px-2 sm:px-3"
                )}
              >
                <span className="truncate">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Animated indicator for segmented variant */}
          {variant === "segmented" && (
            <motion.div
              className="absolute bottom-0 h-0.5 bg-primary rounded-full"
              style={indicatorStyle}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none mt-4"
            tabIndex={-1}
          >
            <TabsContent value={activeTab} className="outline-none" forceMount>
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Tab navigation hints for keyboard users */}
      <div className="sr-only" aria-live="polite">
        {tabs.find((t) => t.id === activeTab)?.label}
      </div>

      {/* Swipe hint for mobile users (only show on first load) */}
      {variant === "segmented" && (
        <div className="mt-2 text-xs text-muted-foreground text-center sm:hidden">
          {t("swipeHint")}
        </div>
      )}
    </div>
  );
}
