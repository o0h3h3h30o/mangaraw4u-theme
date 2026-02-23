"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  adminApi,
  type AdminMangaDetail,
  type AdminChapter,
} from "@/lib/api/endpoints/admin";
import { MangaForm, type MangaFormData } from "@/components/admin/manga-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

type SortKey = "number" | "id";
type SortDir = "asc" | "desc";

export default function AdminMangaEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const mangaId = Number(id);
  const [manga, setManga] = useState<AdminMangaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Chapters
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [deleteChapterId, setDeleteChapterId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    adminApi
      .getManga(mangaId)
      .then(setManga)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load manga");
        router.push("/admin/manga");
      })
      .finally(() => setLoading(false));
  }, [mangaId, router]);

  const fetchChapters = useCallback(async () => {
    setLoadingChapters(true);
    try {
      const res = await adminApi.listChapters(mangaId);
      setChapters(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load chapters");
    } finally {
      setLoadingChapters(false);
    }
  }, [mangaId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleSubmit = async (data: MangaFormData) => {
    await adminApi.updateManga(mangaId, data);
    toast.success("Manga updated");
    router.push("/admin/manga");
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;
    setDeleting(true);
    try {
      await adminApi.deleteChapter(deleteChapterId);
      toast.success("Chapter deleted");
      setDeleteChapterId(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteChapterId);
        return next;
      });
      fetchChapters();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDeleteChapters = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await adminApi.bulkDeleteChapters(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} chapters`);
      setSelectedIds(new Set());
      setShowBulkDelete(false);
      fetchChapters();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleChapterVisibility = async (chapter: AdminChapter) => {
    try {
      await adminApi.updateChapter(chapter.id, { is_show: chapter.is_show === 1 ? 0 : 1 });
      fetchChapters();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  // Sort logic
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedChapters = [...chapters].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "number") {
      cmp = parseFloat(a.number || "0") - parseFloat(b.number || "0");
    } else {
      cmp = a.id - b.id;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

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
    if (selectedIds.size === chapters.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(chapters.map((c) => c.id)));
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!manga) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Manga</h1>
      <MangaForm
        initialData={manga}
        onSubmit={handleSubmit}
        submitLabel="Update"
      />

      {/* Chapters Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Chapters ({chapters.length})</CardTitle>
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
                <Link prefetch={false} href={`/admin/manga/${mangaId}/chapters/new`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingChapters ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={chapters.length > 0 && selectedIds.size === chapters.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-3">
                      <button onClick={() => toggleSort("id")} className="inline-flex items-center hover:text-foreground">
                        ID <SortIcon column="id" />
                      </button>
                    </th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">
                      <button onClick={() => toggleSort("number")} className="inline-flex items-center hover:text-foreground">
                        Number <SortIcon column="number" />
                      </button>
                    </th>
                    <th className="text-center p-3">Views</th>
                    <th className="text-center p-3">Visible</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChapters.map((ch) => (
                    <tr key={ch.id} className={`border-b hover:bg-muted/30 ${selectedIds.has(ch.id) ? "bg-primary/5" : ""}`}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(ch.id)}
                          onChange={() => toggleSelect(ch.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">{ch.id}</td>
                      <td className="p-3 font-medium">{ch.name}</td>
                      <td className="p-3 text-muted-foreground">{ch.number}</td>
                      <td className="p-3 text-center">{ch.view?.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleChapterVisibility(ch)}
                          className="inline-flex items-center justify-center"
                          title={ch.is_show ? "Visible" : "Hidden"}
                        >
                          {ch.is_show ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link prefetch={false} href={`/admin/manga/${mangaId}/chapters/${ch.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteChapterId(ch.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {chapters.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        No chapters yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Single Chapter Dialog */}
      <Dialog open={deleteChapterId !== null} onOpenChange={() => setDeleteChapterId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this chapter and all its pages. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteChapterId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteChapter} disabled={deleting}>
              {deleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Chapters Dialog */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Chapters</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete {selectedIds.size} chapters and all their pages. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDeleteChapters} disabled={bulkDeleting}>
              {bulkDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete {selectedIds.size} Chapters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
