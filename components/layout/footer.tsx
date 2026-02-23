"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container } from "./container";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Facebook, Twitter, MessageCircle } from "lucide-react";

const socialLinks = [
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://twitter.com",
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: "https://discord.com",
    label: "Discord",
    icon: MessageCircle,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("footer");
  const tNav = useTranslations("navigation");

  const navigationLinks = [
    { href: "/", label: tNav("home") },
    { href: "/browse?sort=-views", label: tNav("hot") },
    { href: "/browse", label: tNav("recent") },
    { href: "/library", label: tNav("library") },
  ];

  const userLinks = [
    { href: "/profile", label: tNav("profile") },
    { href: "/login", label: t("login") },
    { href: "/register", label: t("register") },
  ];

  return (
    <footer className="border-t bg-background">
      <Container className="py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Navigation Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("navigation")}</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    prefetch={false}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("account")}</h3>
            <ul className="space-y-2">
              {userLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    prefetch={false}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media & Branding Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("followUs")}</h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <Link
                  prefetch={false}
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link prefetch={false} href="/" className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6" />
                <span className="font-bold">{t("brandName")}</span>
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("tagline")}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("copyright", { year: currentYear })}</p>
        </div>
      </Container>
    </footer>
  );
}
