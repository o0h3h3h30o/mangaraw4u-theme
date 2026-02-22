"use client";

import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/endpoints/admin";
import { MangaForm, type MangaFormData } from "@/components/admin/manga-form";
import { toast } from "sonner";

export default function AdminMangaNewPage() {
  const router = useRouter();

  const handleSubmit = async (data: MangaFormData) => {
    await adminApi.createManga(data);
    toast.success("Manga created");
    router.push("/admin/manga");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Manga</h1>
      <MangaForm onSubmit={handleSubmit} submitLabel="Create" />
    </div>
  );
}
