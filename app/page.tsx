"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const items = useMemo(
    () => [
      { group: "Musique", label: "Le piano", value: "piano-debutant" },
      { group: "Programmation", label: "HTML", value: "html-essentials" },
    ],
    []
  );
  const groups = Array.from(new Set(items.map(i => i.group)));
  const [value, setValue] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    router.push(`/parcours/${value}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-4xl font-bold mb-2">Que veux-tu apprendre aujourd'hui ?</h1>
      <p className="text-gray-600 mb-6">Sélectionne un thème puis lance ton micro-parcours.</p>

      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 text-left">
        <label htmlFor="topic" className="block text-sm font-medium">Sélection</label>
        <select
          id="topic"
          className="border rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">— Choisir —</option>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {items.filter(i => i.group === g).map(i => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:opacity-40"
          disabled={!value}
        >
          Ouvrir le parcours
        </button>
      </form>
    </div>
  );
}
