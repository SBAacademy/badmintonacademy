"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileConversionBar } from "@/components/layout/MobileConversionBar";
import { FooterSettings } from "@/data/footer";

export function AppLayoutWrapper({
  children,
  initialCentres,
  initialPrograms,
  initialFooterSettings,
}: {
  children: React.ReactNode;
  initialCentres?: any[];
  initialPrograms?: any[];
  initialFooterSettings?: FooterSettings;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen w-full bg-[#07090D]">{children}</main>;
  }

  return (
    <>
      <Navbar initialCentres={initialCentres} />
      <main className="flex-1 w-full">{children}</main>
      <Footer
        initialCentres={initialCentres}
        initialPrograms={initialPrograms}
        initialSettings={initialFooterSettings}
      />
      <MobileConversionBar />
    </>
  );
}
