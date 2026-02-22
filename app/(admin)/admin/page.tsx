"use client";

import { useEffect, useState } from "react";
import { BookOpen, Layers, Users, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { adminApi, type AdminStats } from "@/lib/api/endpoints/admin";

function StatsCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-destructive">Error: {error}</div>;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Manga" value={stats.total_manga} icon={BookOpen} />
        <StatsCard title="Total Chapters" value={stats.total_chapters} icon={Layers} />
        <StatsCard title="Total Users" value={stats.total_users} icon={Users} />
        <StatsCard title="Total Comments" value={stats.total_comments} icon={MessageSquare} />
      </div>
    </div>
  );
}
