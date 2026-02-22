"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminManga } from "@/lib/api/endpoints/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AdminMangaPage() {
  const [mangas, setMangas] = useState<AdminManga[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMangas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listMangas({ page, per_page: 20, q: search || undefined });
      setMangas(res.data);
      setLastPage(res.meta?.pagination?.last_page || 1);
      setTotal(res.meta?.pagination?.total || 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchMangas(); }, [fetchMangas]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteManga(deleteId);
      toast.success("Manga deleted");
      setDeleteId(null);
      fetchMangas();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manga ({total})</h1>
        <Link href="/admin/manga/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Manga</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search manga..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Slug</th>
                  <th className="text-center p-3">Chapters</th>
                  <th className="text-center p-3">Views</th>
                  <th className="text-center p-3">Public</th>
                  <th className="text-center p-3">Hot</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mangas.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{m.id}</td>
                    <td className="p-3 font-medium max-w-[200px] truncate">{m.name}</td>
                    <td className="p-3 text-muted-foreground max-w-[150px] truncate">{m.slug}</td>
                    <td className="p-3 text-center">
                      <Link href={`/admin/manga/${m.id}`} className="text-primary hover:underline">
                        {m.chapter_count}
                      </Link>
                    </td>
                    <td className="p-3 text-center">{m.views?.toLocaleString()}</td>
                    <td className="p-3 text-center">{m.is_public ? "Yes" : "No"}</td>
                    <td className="p-3 text-center">{m.hot ? "Yes" : "No"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/manga/${m.id}`} title="Chapters">
                          <Button variant="ghost" size="sm">
                            <BookOpen className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/manga/${m.id}`} title="Edit">
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(m.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {mangas.length === 0 && (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No manga found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} / {lastPage}</span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this manga and all its chapters. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
