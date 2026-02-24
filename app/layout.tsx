import type { Metadata } from "next";
import { Noto_Sans, Road_Rage } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { GoogleOAuthProvider } from "@/components/providers/google-oauth-provider";
import { ReactQueryProvider } from "@/components/providers/query-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/header/navbar";
import { Footer } from "@/components/layout/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { generateDefaultMetadata } from "@/lib/seo/metadata";
import { generateWebsiteSchema } from "@/lib/seo/json-ld";
import { DEFAULT_LOCALE, TIMEZONE } from "@/lib/i18n/config";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const roadRage = Road_Rage({
  variable: "--font-road-rage",
  subsets: ["latin"],
  weight: ["400"],
});

/**
 * Root Layout Metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateDefaultMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${notoSans.variable} ${roadRage.variable} antialiased`}>
        <NextIntlClientProvider
          messages={messages}
          locale={DEFAULT_LOCALE}
          timeZone={TIMEZONE}
          now={new Date()}
        >
          <ReactQueryProvider>
            <GoogleOAuthProvider>
              <ThemeProvider>
                <div className="relative min-h-screen flex flex-col">
                  {/* Global Background Layers */}
                  <div className="fixed inset-0 bg-gradient-to-b from-background to-background/90 z-[-1]" />
                  <div className="fixed inset-0 bg-[url('/bg-pattern.svg')] opacity-20 dark:opacity-50 z-[-1] pointer-events-none" />

                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster />
              </ThemeProvider>
            </GoogleOAuthProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
