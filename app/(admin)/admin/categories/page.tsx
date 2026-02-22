"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminCategory } from "@/lib/api/endpoints/admin";
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editItem, setEditItem] = useState<AdminCategory | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formShowHome, setFormShowHome] = useState(0);
  const [formJpName, setFormJpName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listCategories(search || undefined);
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteCategory(deleteId);
      toast.success("Category deleted");
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setFormName(""); setFormSlug(""); setFormShowHome(0); setFormJpName("");
    setShowCreate(true);
  };

  const openEdit = (item: AdminCategory) => {
    setEditItem(item);
    setFormName(item.name);
    setFormSlug(item.slug);
    setFormShowHome(item.show_home);
    setFormJpName(item.jp_name || "");
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!formName || !formSlug) { toast.error("Name and slug are required"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await adminApi.updateCategory(editItem.id, { name: formName, slug: formSlug, show_home: formShowHome, jp_name: formJpName || undefined });
        toast.success("Category updated");
      } else {
        await adminApi.createCategory({ name: formName, slug: formSlug, show_home: formShowHome, jp_name: formJpName || undefined });
        toast.success("Category created");
      }
      setShowCreate(false);
      fetchData();
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
        <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                  <th className="text-left p-3">JP Name</th>
                  <th className="text-center p-3 w-24">Show Home</th>
                  <th className="text-right p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{c.id}</td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.slug}</td>
                    <td className="p-3 text-muted-foreground">{c.jp_name || "—"}</td>
                    <td className="p-3 text-center">{c.show_home ? "Yes" : "No"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No categories found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={formName} onChange={(e) => autoSlug(e.target.value)} />
            <Input placeholder="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
            <Input placeholder="JP Name" value={formJpName} onChange={(e) => setFormJpName(e.target.value)} />
            <div className="flex items-center gap-2">
              <label className="text-sm">Show Home:</label>
              <select className="border rounded px-2 py-1 text-sm" value={formShowHome} onChange={(e) => setFormShowHome(Number(e.target.value))}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
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
          <p className="text-sm text-muted-foreground">This will permanently delete this category and remove it from all manga. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner className="h-4 w-4 mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
