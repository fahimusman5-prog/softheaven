"use client";
import { useEffect, useState } from "react";

type Row = Record<string, unknown>;

export function RelationField({
  target,
  value,
  required,
  onChange,
}: {
  target: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          "/api/admin/" + target + "?" + new URLSearchParams({ q: search }),
          { cache: "no-store" },
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Unable to load choices");
        if (active) {
          setRows(result.rows);
          setError("");
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [target, search]);
  useEffect(() => {
    let active = true;
    setSelected(null);
    if (value)
      fetch("/api/admin/" + target + "?" + new URLSearchParams({ id: value }), {
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((result) => {
          if (active) setSelected(result.rows?.[0] ?? null);
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [target, value]);
  const choices =
    selected && !rows.some((row) => row.id === selected.id)
      ? [selected, ...rows]
      : rows;
  return (
    <>
      <input
        type="search"
        aria-label="Search available choices"
        placeholder="Search by name, email or code…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a record</option>
        {value && !choices.some((row) => row.id === value) && (
          <option value={value}>Current selection</option>
        )}
        {choices.map((row) => (
          <option key={String(row.id)} value={String(row.id)}>
            {String(row.name || row.email || row.code || row.label || row.id)}
          </option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </>
  );
}

const settingsFields: Record<string, Array<[string, string, string?]>> = {
  general: [
    ["store_name", "Store name"],
    ["currency", "Currency", "fixed"],
    ["timezone", "Timezone", "fixed"],
    ["email", "Contact email", "email"],
    ["phone", "Contact phone"],
    ["address", "Address", "textarea"],
  ],
  social: [
    ["whatsapp", "WhatsApp URL", "url"],
    ["instagram", "Instagram URL", "url"],
    ["facebook", "Facebook URL", "url"],
    ["tiktok", "TikTok URL", "url"],
  ],
  seo: [
    ["title", "Default page title"],
    ["description", "Search description", "textarea"],
  ],
  footer: [
    ["description", "Footer description", "textarea"],
    ["copyright", "Copyright text"],
    ["newsletter_text", "Newsletter text"],
  ],
};
export function SettingsFields({
  id,
  value,
  onChange,
}: {
  id: string;
  value: Row;
  onChange: (value: Row) => void;
}) {
  return (
    <>
      {settingsFields[id]?.map(([key, label, type]) => (
        <label key={key}>
          {label}
          {type === "textarea" ? (
            <textarea
              value={String(value[key] ?? "")}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          ) : (
            <input
              type={type === "email" || type === "url" ? type : "text"}
              readOnly={type === "fixed"}
              value={String(value[key] ?? "")}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          )}
        </label>
      ))}
    </>
  );
}
