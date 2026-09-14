import { permanentRedirect, notFound } from "next/navigation";
import { LOCATION_SLUGS } from "@/data/locations";
import { getCentreBySlug, getCentres } from "@/lib/contentDb";

export const dynamic = "force-dynamic";

interface BranchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const dynamicCentres = await getCentres({ includeInactive: false });
  const slugs = new Set<string>([...LOCATION_SLUGS, ...dynamicCentres.map((c) => c.slug)]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export default async function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { slug } = await params;

  if (LOCATION_SLUGS.includes(slug)) {
    permanentRedirect(`/${slug}`);
  }

  const dynamicCentre = await getCentreBySlug(slug);
  if (dynamicCentre) {
    permanentRedirect(`/${slug}`);
  }

  notFound();
}
