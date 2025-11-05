// app/parcours/[slug]/page.tsx
import CourseClient from "./CourseClient";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>; // Next 15 : params est un Promise côté serveur
}) {
  const { slug } = await params;     // on résout ici (côté serveur)
  return <CourseClient slug={slug} />; // on passe un string au client
}
