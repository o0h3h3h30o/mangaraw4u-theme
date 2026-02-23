"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const t = useTranslations("notFoundPage");
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="max-w-md w-full space-y-8">
        {/* Floating Image */}
        <div className="relative w-72 h-72 mx-auto">
          <Image
            src="/404-not-found.gif"
            alt="Confused Chibi Character"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>

        <div className="space-y-4 relative">
          {/* Background Number */}
          <h1 className="text-[10rem] font-black text-primary/5 tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] -z-10 select-none">
            404
          </h1>

          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("heading")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-colors min-w-[140px]"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backButton")}
          </Button>

          <Button
            asChild
            size="lg"
            className="rounded-full gap-2 shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all min-w-[140px]"
          >
            <Link prefetch={false} href="/">
              <Home className="w-4 h-4" />
              {t("homeButton")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
