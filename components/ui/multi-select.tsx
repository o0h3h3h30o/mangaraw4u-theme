"use client";

import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: number;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (value: number) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const remove = (value: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const selectedItems = selected
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-1 text-sm shadow-xs hover:bg-accent/50 transition-colors",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedItems.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedItems.map(
              (item) =>
                item && (
                  <Badge
                    key={item.value}
                    variant="secondary"
                    className="gap-1 text-xs"
                  >
                    {item.label}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => remove(item.value, e)}
                    />
                  </Badge>
                )
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex w-full rounded-md border bg-background px-3 py-1.5 text-sm mb-2 outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="max-h-60 overflow-y-auto">
          {filtered.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              onClick={() => toggle(option.value)}
            >
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-sm border shrink-0",
                  selected.includes(option.value) &&
                    "bg-primary border-primary text-primary-foreground"
                )}
              >
                {selected.includes(option.value) && (
                  <Check className="h-3 w-3" />
                )}
              </div>
              <span className="truncate">{option.label}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No results
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
