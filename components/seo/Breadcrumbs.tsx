import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { SEOJsonLd } from "./SEOJsonLd";
import { getBreadcrumbSchema } from "@/lib/seo";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const fullItems = [{ name: "Home", url: "/" }, ...items];

  return (
    <>
      <SEOJsonLd schema={getBreadcrumbSchema(fullItems)} />
      <nav aria-label="Breadcrumb" className="py-3 px-4 mb-6 rounded-lg bg-[#111827]/70 border border-slate-800 text-sm">
        <ol className="flex items-center flex-wrap gap-2 text-slate-400">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                {index === 0 && <Home className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
                {isLast ? (
                  <span className="text-emerald-400 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.url} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
