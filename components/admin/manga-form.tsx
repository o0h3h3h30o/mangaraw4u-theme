"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select";
import { RichEditor } from "@/components/ui/rich-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminApi,
  type AdminMangaDetail,
} from "@/lib/api/endpoints/admin";
import { genreApi } from "@/lib/api/endpoints/manga";
import { toast } from "sonner";
import { ArrowLeft, Save, RefreshCw, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface MangaFormData {
  name: string;
  slug: string;
  otherNames: string;
  from_manga18fx: string;
  summary: string;
  status_id: number;
  is_public: number;
  hot: number;
  caution: number;
  category_ids: number[];
  author_ids: number[];
  artist_ids: number[];
}

interface MangaFormProps {
  initialData?: AdminMangaDetail;
  onSubmit: (data: MangaFormData) => Promise<void>;
  submitLabel: string;
}

export function MangaForm({ initialData, onSubmit, submitLabel }: MangaFormProps) {
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form fields
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [otherNames, setOtherNames] = useState(initialData?.otherNames || "");
  const [fromManga18fx, setFromManga18fx] = useState(initialData?.from_manga18fx || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [statusId, setStatusId] = useState(String(initialData?.status_id || 1));
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? 1);
  const [hot, setHot] = useState(initialData?.hot || 0);
  const [caution, setCaution] = useState(initialData?.caution || 0);

  // Cover image
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Relations
  const [categoryIds, setCategoryIds] = useState<number[]>(
    initialData?.categories?.map((c) => c.id) || []
  );
  const [authorIds, setAuthorIds] = useState<number[]>(
    initialData?.authors?.map((a) => a.id) || []
  );
  const [artistIds, setArtistIds] = useState<number[]>(
    initialData?.artists?.map((a) => a.id) || []
  );

  // Options for selects
  const [categoryOptions, setCategoryOptions] = useState<MultiSelectOption[]>([]);
  const [authorOptions, setAuthorOptions] = useState<MultiSelectOption[]>([]);

  useEffect(() => {
    Promise.all([
      genreApi.getList().then((res) =>
        res.data.map((g) => ({ value: g.id, label: g.name }))
      ),
      adminApi.listAuthors().then((data) =>
        data.map((a) => ({ value: a.id, label: a.name }))
      ),
    ])
      .then(([cats, authors]) => {
        setCategoryOptions(cats);
        setAuthorOptions(authors);
      })
      .catch((err) => {
        toast.error("Failed to load options");
        console.error(err);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  // Update form when initialData changes (async load)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setOtherNames(initialData.otherNames || "");
      setFromManga18fx(initialData.from_manga18fx || "");
      setSummary(initialData.summary || "");
      setStatusId(String(initialData.status_id || 1));
      setIsPublic(initialData.is_public ?? 1);
      setHot(initialData.hot || 0);
      setCaution(initialData.caution || 0);
      setCategoryIds(initialData.categories?.map((c) => c.id) || []);
      setAuthorIds(initialData.authors?.map((a) => a.id) || []);
      setArtistIds(initialData.artists?.map((a) => a.id) || []);
    }
  }, [initialData]);

  // Track whether slug was manually edited (only for create mode)
  const slugManuallyEdited = useRef(false);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug when creating new manga (unless manually edited)
    if (!initialData && !slugManuallyEdited.current) {
      setSlug(toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    slugManuallyEdited.current = true;
    setSlug(value);
  };

  const regenerateSlug = () => {
    setSlug(toSlug(name));
    slugManuallyEdited.current = false;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !initialData?.id) return;

    setUploadingCover(true);
    try {
      const res = await adminApi.uploadCover(initialData.id, file);
      setCoverPreview(res.data.url + "?t=" + Date.now());
      toast.success("Cover uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const currentCoverUrl = coverPreview || (initialData?.slug ? `/cover/${initialData.slug}.jpg` : null);

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name,
        slug,
        otherNames,
        from_manga18fx: fromManga18fx,
        summary,
        status_id: parseInt(statusId),
        is_public: isPublic,
        hot,
        caution,
        category_ids: categoryIds,
        author_ids: authorIds,
        artist_ids: artistIds,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/manga"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Manga List
        </Link>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {submitLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <Input value={name} onChange={(e) => handleNameChange(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug *</label>
                <div className="flex gap-2">
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={regenerateSlug}
                    title="Re-generate from name"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Other Names</label>
                <Input
                  value={otherNames}
                  onChange={(e) => setOtherNames(e.target.value)}
                  placeholder="Alternative names, comma separated"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">From Manga18fx</label>
                <Input
                  value={fromManga18fx}
                  onChange={(e) => setFromManga18fx(e.target.value)}
                  placeholder="Source URL from manga18fx"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Summary</label>
                <RichEditor value={summary} onChange={setSummary} />
              </div>
            </CardContent>
          </Card>

          {/* Relations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories & Authors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Categories</label>
                <MultiSelect
                  options={categoryOptions}
                  selected={categoryIds}
                  onChange={setCategoryIds}
                  placeholder="Select categories..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Authors</label>
                <MultiSelect
                  options={authorOptions}
                  selected={authorIds}
                  onChange={setAuthorIds}
                  placeholder="Select authors..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Artists</label>
                <MultiSelect
                  options={authorOptions}
                  selected={artistIds}
                  onChange={setArtistIds}
                  placeholder="Select artists..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Cover & Settings */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative aspect-[250/350] w-full rounded-md border bg-muted overflow-hidden">
                  {currentCoverUrl ? (
                    <Image
                      src={currentCoverUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-muted-foreground ${currentCoverUrl ? "hidden" : ""}`}>
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <span className="text-xs">No cover</span>
                  </div>
                </div>
                {initialData?.id ? (
                  <>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                    >
                      {uploadingCover ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Cover
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">
                    Save manga first, then upload cover
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusId} onValueChange={setStatusId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ongoing</SelectItem>
                    <SelectItem value="2">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Public</label>
                <Switch
                  checked={isPublic === 1}
                  onCheckedChange={(v) => setIsPublic(v ? 1 : 0)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Hot</label>
                <Switch
                  checked={hot === 1}
                  onCheckedChange={(v) => setHot(v ? 1 : 0)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">18+ (Caution)</label>
                <Switch
                  checked={caution === 1}
                  onCheckedChange={(v) => setCaution(v ? 1 : 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
