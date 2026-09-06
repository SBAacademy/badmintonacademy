import { permanentRedirect, notFound } from "next/navigation";
import { LOCATION_SLUGS } from "@/data/locations";

interface BranchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return LOCATION_SLUGS.map((slug) => ({ slug }));
}

export default async function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { slug } = await params;

  if (LOCATION_SLUGS.includes(slug)) {
    permanentRedirect(`/${slug}`);
  }

  notFound();
}
