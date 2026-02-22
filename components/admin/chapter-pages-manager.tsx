"use client";

import { useState, useEffect, useRef } from "react";
import { adminApi, type AdminPage } from "@/lib/api/endpoints/admin";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon, Link as LinkIcon, CheckSquare, Square, X } from "lucide-react";
import Image from "next/image";

interface ChapterPagesManagerProps {
  chapterId: number;
}

export function ChapterPagesManager({ chapterId }: ChapterPagesManagerProps) {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [mangaSlug, setMangaSlug] = useState("");
  const [chapterSlug, setChapterSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletePageId, setDeletePageId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // External URLs input
  const [urlsText, setUrlsText] = useState("");
  const [addingUrls, setAddingUrls] = useState(false);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchPages = async () => {
    try {
      const data = await adminApi.getChapterPages(chapterId);
      setPages(data.pages);
      setMangaSlug(data.manga_slug);
      setChapterSlug(data.chapter_slug);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPageUrl = (page: AdminPage) => {
    if (page.external === 1) return page.image;
    return `/manga/${mangaSlug}/chapters/${chapterSlug}/${page.image}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const res = await adminApi.uploadChapterPages(chapterId, fileArray);
      toast.success(`Uploaded ${res.data.uploaded} pages`);
      await fetchPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrls = async () => {
    const urls = urlsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (urls.length === 0) {
      toast.error("No URLs entered");
      return;
    }

    setAddingUrls(true);
    try {
      const res = await adminApi.addChapterPageUrls(chapterId, urls);
      toast.success(`Added ${res.data.added} pages`);
      setUrlsText("");
      await fetchPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add URLs");
    } finally {
      setAddingUrls(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePageId) return;
    setDeleting(true);
    try {
      await adminApi.deleteChapterPage(deletePageId);
      toast.success("Page deleted");
      setDeletePageId(null);
      await fetchPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Multi-select helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await adminApi.bulkDeletePages(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} pages`);
      setSelectedIds(new Set());
      setShowBulkDelete(false);
      await fetchPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pages ({pages.length})</CardTitle>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedIds.size})
                </Button>
              )}
              {pages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedIds.size === pages.length ? (
                    <X className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  )}
                  {selectedIds.size === pages.length ? "Deselect All" : "Select All"}
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Files
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* External URLs input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              External Image URLs
            </label>
            <textarea
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              placeholder={"Paste image URLs, one per line:\nhttps://example.com/page1.jpg\nhttps://example.com/page2.jpg"}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddUrls}
              disabled={addingUrls || !urlsText.trim()}
            >
              {addingUrls ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <LinkIcon className="h-4 w-4 mr-2" />
              )}
              Add URLs
            </Button>
          </div>

          {/* Pages grid */}
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2" />
              <p className="text-sm">No pages yet. Upload files or add URLs to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {pages.map((page) => {
                const isSelected = selectedIds.has(page.id);
                return (
                  <div key={page.id} className="group relative">
                    <div
                      className={`relative aspect-[2/3] rounded-md border-2 bg-muted overflow-hidden cursor-pointer transition-colors ${
                        isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                      }`}
                      onClick={() => toggleSelect(page.id)}
                    >
                      <Image
                        src={getPageUrl(page)}
                        alt={`Page ${page.slug}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {page.external === 1 && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1 rounded">
                          EXT
                        </div>
                      )}
                      {/* Selection checkbox */}
                      <div className="absolute top-1 left-1">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary drop-shadow-md" />
                        ) : (
                          <Square className="h-5 w-5 text-white/70 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1.5 py-1 rounded-b-md">
                      <span className="text-xs text-white font-mono">{page.slug}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletePageId(page.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Delete Confirm */}
      <Dialog open={deletePageId !== null} onOpenChange={() => setDeletePageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this page? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePageId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Pages</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {selectedIds.size} selected pages? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete {selectedIds.size} Pages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
