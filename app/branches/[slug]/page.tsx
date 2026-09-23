import { permanentRedirect, notFound } from "next/navigation";
import { getCentreBySlug, getCentres } from "@/lib/contentDb";

export const dynamic = "force-dynamic";

interface BranchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const dynamicCentres = await getCentres({ includeInactive: false });
  return dynamicCentres.map((c) => ({ slug: c.slug }));
}

export default async function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { slug } = await params;
  const dynamicCentre = await getCentreBySlug(slug);

  if (dynamicCentre && dynamicCentre.status !== "INACTIVE" && dynamicCentre.isActive !== false) {
    permanentRedirect(`/${slug}`);
  }

  notFound();
}
