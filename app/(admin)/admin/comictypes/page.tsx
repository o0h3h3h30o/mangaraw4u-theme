"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminComicType } from "@/lib/api/endpoints/admin";
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
import { Plus, Trash2, Pencil } from "lucide-react";

export default function AdminComicTypesPage() {
  const [types, setTypes] = useState<AdminComicType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editItem, setEditItem] = useState<AdminComicType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formLabel, setFormLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listComicTypes();
      setTypes(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteComicType(deleteId);
      toast.success("Comic type deleted");
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
    setFormLabel("");
    setShowCreate(true);
  };

  const openEdit = (item: AdminComicType) => {
    setEditItem(item);
    setFormLabel(item.label);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!formLabel) { toast.error("Label is required"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await adminApi.updateComicType(editItem.id, { label: formLabel });
        toast.success("Comic type updated");
      } else {
        await adminApi.createComicType({ label: formLabel });
        toast.success("Comic type created");
      }
      setShowCreate(false);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comic Types ({types.length})</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Type</Button>
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
                  <th className="text-left p-3">Label</th>
                  <th className="text-right p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{t.id}</td>
                    <td className="p-3 font-medium">{t.label}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {types.length === 0 && (
                  <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No comic types found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Comic Type" : "New Comic Type"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Label" value={formLabel} onChange={(e) => setFormLabel(e.target.value)} />
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
          <p className="text-sm text-muted-foreground">This will permanently delete this comic type. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Spinner className="h-4 w-4 mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
