"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi, type AdminChapter } from "@/lib/api/endpoints/admin";
import { ChapterForm, type ChapterFormData } from "@/components/admin/chapter-form";
import { ChapterPagesManager } from "@/components/admin/chapter-pages-manager";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AdminChapterEditPage() {
  const { id, chapterId } = useParams();
  const router = useRouter();
  const mangaId = Number(id);
  const chId = Number(chapterId);

  const [chapter, setChapter] = useState<AdminChapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch chapter data from the list (no dedicated detail endpoint)
    adminApi
      .listChapters(mangaId)
      .then((res) => {
        const ch = res.data.find((c) => c.id === chId);
        if (ch) {
          setChapter(ch);
        } else {
          toast.error("Chapter not found");
          router.push(`/admin/manga/${mangaId}`);
        }
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load chapter");
        router.push(`/admin/manga/${mangaId}`);
      })
      .finally(() => setLoading(false));
  }, [mangaId, chId, router]);

  const handleSubmit = async (data: ChapterFormData) => {
    await adminApi.updateChapter(chId, data);
    toast.success("Chapter updated");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Chapter</h1>
      <ChapterForm
        mangaId={mangaId}
        initialData={chapter}
        onSubmit={handleSubmit}
        submitLabel="Update"
      />

      {/* Pages Manager */}
      <div className="mt-6">
        <ChapterPagesManager chapterId={chId} />
      </div>
    </div>
  );
}
