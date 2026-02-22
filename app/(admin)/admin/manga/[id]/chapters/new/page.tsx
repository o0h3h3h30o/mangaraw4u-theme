"use client";

import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/endpoints/admin";
import { ChapterForm, type ChapterFormData } from "@/components/admin/chapter-form";
import { toast } from "sonner";

export default function AdminChapterNewPage() {
  const { id } = useParams();
  const router = useRouter();
  const mangaId = Number(id);

  const handleSubmit = async (data: ChapterFormData) => {
    await adminApi.createChapter(mangaId, data);
    toast.success("Chapter created");
    router.push(`/admin/manga/${mangaId}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Chapter</h1>
      <ChapterForm
        mangaId={mangaId}
        onSubmit={handleSubmit}
        submitLabel="Create"
      />
    </div>
  );
}
