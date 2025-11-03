"use client";


import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();


  // items: value = slug or topic key
  const items = useMemo(
    () => [
      { group: "Musique", label: "Le piano", value: "piano" },
      { group: "Programmation", label: "HTML", value: "html" },
    ],
    []
  );


  const [value, setValue] = useState("");


  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    router.push(`/parcours/new?slug=${encodeURIComponent(value)}`);
  }


  const groups = Array.from(new Set(items.map((i) => i.group)));


  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-4xl font-bold mb-8">Que veux-tu apprendre aujourd'hui ?</h1>

      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 text-left">
        <label htmlFor="topic" className="block text-sm font-medium">
          Sélectionne un thème :
        </label>
        <select
          id="topic"
          className="border rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">— Choisir —</option>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {items
                .filter((i) => i.group === g)
                .map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>


        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg">
          Générer mon parcours
        </button>
      </form>
    </div>
  );
}