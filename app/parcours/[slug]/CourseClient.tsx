// app/parcours/[slug]/CourseClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type LessonContent = {
  text?: string;
  image?: string;
  imagePrompt?: string;
  note?: string;
}
type Lesson = { step: number; title: string; content: LessonContent[]; };
type Plan = { title: string; slug: string; summary: string; duration: string; lessons: Lesson[] };

export default function CourseClient({ slug }: { slug: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const storageKey = `progress:${slug}`;
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw));
    } catch { }
  }, [storageKey]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // 👇 Ici slug est DEFINI (passé en prop depuis la page serveur)
        const res = await fetch(`/courses/${slug}.json`, { cache: "no-store" });
        if (!res.ok) throw new Error("Parcours introuvable");
        const data = (await res.json()) as Plan;
        setPlan(data);
        const firstTodo = data.lessons.find((l) => !done[l.step]);
        if (firstTodo) setCurrentStep(firstTodo.step);
      } catch (e: any) {
        setError(e?.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch { }
  }, [done, storageKey]);

  const progressPct = useMemo(() => {
    if (!plan?.lessons?.length) return 0;
    const total = plan.lessons.length;
    const completed = plan.lessons.filter((l) => done[l.step]).length;
    return Math.round((completed / total) * 100);
  }, [plan, done]);

  if (loading) return <div className="max-w-3xl mx-auto p-6">Chargement…</div>;
  if (error)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Oups…</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Link className="text-blue-600 underline" href="/">← Accueil</Link>
      </div>
    );
  if (!plan) return <div className="max-w-3xl mx-auto p-6">Parcours introuvable.</div>;

  const lesson = plan.lessons.find((l) => l.step === currentStep) || plan.lessons[0];

  function toggleDone(step: number) {
    setDone((d) => ({ ...d, [step]: !d[step] }));
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">{plan.title}</h1>
            <p className="text-gray-600">{plan.duration}</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 underline">← Accueil</Link>
        </div>
        <p className="mt-3 text-gray-700">{plan.summary}</p>
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-1 text-xs text-gray-600">{progressPct}% terminé</div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6">
        {plan.lessons.map((l) => (
          <button
            key={l.step}
            onClick={() => setCurrentStep(l.step)}
            className={
              "px-3 py-1.5 rounded-full border text-sm " +
              (currentStep === l.step
                ? "bg-blue-600 text-white border-blue-600"
                : done[l.step]
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-300 text-gray-700")
            }
          >
            Étape {l.step}
          </button>
        ))}
      </nav>

      <article className="border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">Étape {lesson.step} — {lesson.title}</h2>
          <label className="inline-flex items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-600"
              checked={!!done[lesson.step]}
              onChange={() => toggleDone(lesson.step)}
            />
            Marquer comme fait
          </label>
        </div>

        {lesson.content.map((block, i) => {
          if (block.text) return <p className="mt-3 leading-relaxed whitespace-pre-wrap" key={i}>{block.text}</p>;
          if (block.image)
            return (
              <div key={i} className="my-6 flex justify-center">
                <Image
                  src={block.image}
                  alt={lesson.title}
                  width={800}
                  height={400}
                  className="rounded-lg"
                />
              </div>
            );
          if (block.imagePrompt)
            return (
              <figure key={i} className="mt-4 border rounded-xl p-3 bg-gray-50">
                <div className="h-40 w-full rounded-lg bg-white border flex items-center justify-center text-xs text-gray-500">
                  (aperçu image)
                </div>
                <figcaption className="mt-2 text-xs text-gray-600">
                  Suggestion visuelle : {block.imagePrompt}
                </figcaption>
              </figure>
            );
          if (block.note) return <p className="mt-3 leading-relaxed whitespace-pre-wrap text-red-900" key={i}>{block.text}</p>;
        })}

        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={currentStep <= 1}
            onClick={() => setCurrentStep((d) => Math.max(1, d - 1))}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            ← Précédent
          </button>
          <button
            disabled={currentStep >= plan.lessons.length}
            onClick={() => setCurrentStep((d) => Math.min(plan.lessons.length, d + 1))}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      </article>
    </div>
  );
}
