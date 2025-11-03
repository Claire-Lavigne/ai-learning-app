import { NextRequest, NextResponse } from "next/server";

const TOPICS: Record<string, { title: string; duration: string; brief: string }> = {
  "piano": {
    title: "Piano débutant — 5 min/jour",
    duration: "5 min/jour pendant 10 jours",
    brief: "Micro-parcours pour apprendre les bases du piano",
  },
  "html": {
    title: "HTML Essentials — 5 min/jour",
    duration: "5 min/jour pendant 10 jours",
    brief: "Découvrir les balises fondamentales, la structure d'une page et les bonnes pratiques d'accessibilité.",
  },
};

// --- Fonction principale ---
export async function POST(req: NextRequest) {
  try {
    const { slug } = (await req.json()) as { slug?: string };
    if (!slug || !TOPICS[slug]) {
      return NextResponse.json({ error: "Sujet inconnu" }, { status: 400 });
    }

    const meta = TOPICS[slug];
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY manquant" }, { status: 500 });
    }

    const prompt = makePrompt(meta.title, meta.duration, meta.brief);

    // --- Appel OpenAI Chat Completions ---
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Tu es un générateur de micro-parcours éducatifs. Réponds exclusivement avec un JSON valide. " +
              "Aucune explication hors JSON. Les clés attendues : {title, slug, summary, duration, lessons:[{day, title, text, imagePrompt}]}",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Erreur OpenAI : ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ error: "Réponse vide d'OpenAI" }, { status: 500 });
    }

    // Tente de parser le JSON retourné
    let plan;
    try {
      plan = JSON.parse(content);
    } catch (err) {
      console.error("Erreur de parsing JSON :", content);
      return NextResponse.json({ error: "Format JSON invalide" }, { status: 500 });
    }

    return NextResponse.json({ plan }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur inconnue" }, { status: 500 });
  }
}

// --- Prompt envoyé au modèle ---
function makePrompt(title: string, duration: string, brief: string) {
  return `Crée un micro-parcours JSON pour un apprentissage ludique et progressif.
Titre: ${title}
Durée: ${duration}
Description: ${brief}

Structure demandée (en JSON uniquement) :
{
  "title": "...",
  "slug": "...",
  "summary": "...",
  "duration": "...",
  "lessons": [
    {
      "day": 1,
      "title": "...",
      "text": "...",
      "imagePrompt": "..."
    }
  ]
}

Exigences :
- 10 leçons numérotées (day 1 à 10)
- Ton clair, bienveillant et motivant
- Chaque 'text' doit tenir en 3 à 5 phrases maximum
- 'imagePrompt' = description simple d'une image illustrative
Réponds UNIQUEMENT avec un JSON valide.`;
}
