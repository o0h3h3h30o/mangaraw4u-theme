"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface ChapterFormData {
  name: string;
  slug: string;
  number: string;
  is_show: number;
  source_url: string;
  is_crawling: number;
}

interface ChapterFormProps {
  mangaId: number;
  initialData?: { id: number; name: string; slug: string; number?: string; is_show: number; source_url?: string; is_crawling?: number };
  onSubmit: (data: ChapterFormData) => Promise<void>;
  submitLabel: string;
}

export function ChapterForm({ mangaId, initialData, onSubmit, submitLabel }: ChapterFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [number, setNumber] = useState(initialData?.number || "");
  const [isShow, setIsShow] = useState(initialData?.is_show ?? 1);
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || "");
  const [isCrawling, setIsCrawling] = useState(initialData?.is_crawling ?? 0);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialData) {
      setSlug(toSlug(value));
    }
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name, slug, number, is_show: isShow, source_url: sourceUrl, is_crawling: isCrawling });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/manga/${mangaId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Manga
        </Link>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {submitLabel}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chapter Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Chapter 1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Number</label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Slug *</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="chapter-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Source URL</label>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Visible</label>
            <Switch
              checked={isShow === 1}
              onCheckedChange={(v) => setIsShow(v ? 1 : 0)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Is Crawling</label>
            <select
              value={isCrawling}
              onChange={(e) => setIsCrawling(Number(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value={0}>0 - None</option>
              <option value={1}>1 - Pending</option>
              <option value={2}>2 - Crawling</option>
              <option value={3}>3 - Done</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
