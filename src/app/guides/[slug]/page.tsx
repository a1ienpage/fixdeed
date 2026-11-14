import { notFound } from "next/navigation";
import { GUIDES, getGuideBySlug } from "@/content/guides";
import { GuideDetailClient } from "@/components/GuideDetailClient";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return <GuideDetailClient guide={guide} />;
}
