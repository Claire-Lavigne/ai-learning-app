"use client";


import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


type Lesson = {
  day: number;
  title: string;
  text: string;
  imagePrompt?: string;
};


type Plan = {
  title: string;
  slug: string;
  summary: string;
  duration: string; // ex: "5 min/jour pendant 10 jours"
  lessons: Lesson[];
};


export default function NewPlanPage() {
  const sp = useSearchParams();
  const slug = sp.get("slug") || "";
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (!res.ok) throw new Error("Échec de la génération");
        const data = (await res.json()) as { plan: Plan };
        setPlan(data.plan);
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
      }
    })();
  }, [slug]);


  if (!slug)
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p>Paramètre manquant.</p>
      </div>
    );


  if (error)
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Oups…</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );


  if (!plan)
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Génération en cours…</h1>
        <p className="text-gray-600">Préparation de ton micro-parcours.</p>
      </div>
    );



  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">{plan.title}</h1>
      <p className="text-gray-600 mb-4">{plan.duration}</p>
      <p className="mb-6">{plan.summary}</p>


      <ol className="space-y-4">
        {plan.lessons.map((l) => (
          <li key={l.day} className="border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold">Jour {l.day} — {l.title}</h2>
              {l.imagePrompt && (
                <span className="text-xs text-gray-500">image: {l.imagePrompt}</span>
              )}
            </div>
            <p className="mt-2 leading-relaxed">{l.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}