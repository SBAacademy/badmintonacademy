"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileConversionBar } from "@/components/layout/MobileConversionBar";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen w-full bg-[#07090D]">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <MobileConversionBar />
    </>
  );
}
