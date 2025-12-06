import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { User } from "@supabase/supabase-js";
import "./globals.css";
import { AppContextProvider } from "@/lib/contexts/appContext";
import { PodcastProvider } from "@/lib/contexts/PodcastContext";
import { SubscriptionProvider } from "@/lib/contexts/SubscriptionContext";
import { PodcastPlayer } from "@/components/PodcastPlayer";
import UrlToast from "@/components/UrlToast";
import UrlAuthSync from "@/components/UrlAuthSync";
import { Toaster } from "@/components/ui/sonner";
import { DebugPanel } from "@/components/DebugPanel";
import { getUserSubscriptionStatus } from "@/lib/subscription";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "DocTree",
  description: "Interactive Knowledge Trees",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isPro = false;
  let userId: string | null = null;
  let user: User | null = null;

  try {
    const status = await getUserSubscriptionStatus();
    isPro = status.isPro;
    userId = status.userId;
    user = status.user;
  } catch (error) {
    console.error("Failed to get user subscription status:", error);
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppContextProvider initialUser={user}>
          <SubscriptionProvider initialIsPro={isPro} initialUserId={userId}>
            <PodcastProvider>
              {children}
              <PodcastPlayer />
              <DebugPanel />
              <Suspense>
                <UrlToast />
                <UrlAuthSync />
                <Toaster />
              </Suspense>
            </PodcastProvider>
          </SubscriptionProvider>
        </AppContextProvider>
      </body>
    </html>
  );
}
