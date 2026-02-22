"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminTag } from "@/lib/api/endpoints/admin";
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
import { Plus, Trash2, Pencil, Search } from "lucide-react";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editItem, setEditItem] = useState<AdminTag | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listTags(search || undefined);
      setTags(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteTag(deleteId);
      toast.success("Tag deleted");
      setDeleteId(null);
      fetchTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setFormName("");
    setFormSlug("");
    setShowCreate(true);
  };

  const openEdit = (tag: AdminTag) => {
    setEditItem(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!formName || !formSlug) { toast.error("Name and slug are required"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await adminApi.updateTag(editItem.id, { name: formName, slug: formSlug });
        toast.success("Tag updated");
      } else {
        await adminApi.createTag({ name: formName, slug: formSlug });
        toast.success("Tag created");
      }
      setShowCreate(false);
      fetchTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const autoSlug = (name: string) => {
    setFormName(name);
    if (!editItem) setFormSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tags ({tags.length})</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Tag</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 w-16">ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Slug</th>
                  <th className="text-right p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{t.id}</td>
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-muted-foreground">{t.slug}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tags.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No tags found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Tag" : "New Tag"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={formName} onChange={(e) => autoSlug(e.target.value)} />
            <Input placeholder="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Spinner className="h-4 w-4 mr-2" /> : null}{editItem ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete this tag. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner className="h-4 w-4 mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
