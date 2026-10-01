"use client";
import { useEffect, useState } from "react";
export type Row = Record<string, any>;
export const money = (value: unknown) =>
  "LKR " +
  Number(value ?? 0).toLocaleString("en-LK", { maximumFractionDigits: 2 });
export const date = (value: unknown, time = false) =>
  value
    ? new Date(String(value)).toLocaleString("en-GB", {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";
export const human = (value: unknown) =>
  String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
export async function adminRequest(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
) {
  const res = await fetch(
    "/api/admin/" + path,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        }
      : { cache: "no-store", signal },
  );
  const result = await res.json();
  if (!res.ok) {
    console.error("[admin request]", path, result.error);
    throw new Error(
      res.status === 401
        ? "Your session has expired. Sign in again."
        : res.status === 403
          ? "Your role cannot perform this action."
          : result.errorCode === "VALIDATION"
            ? "Check the highlighted details and try again."
            : "This action could not be completed. Check your details and try again.",
    );
  }
  return result;
}
export function useAdminData(path: string) {
  const [data, setData] = useState<Row>({ rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(
      () =>
        adminRequest(path, undefined, controller.signal)
          .then(setData)
          .catch((e) => {
            if (e.name !== "AbortError") setError(e.message);
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          }),
      180,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, revision]);
  return { data, loading, error, refresh: () => setRevision((r) => r + 1) };
}
export function exportRows(rows: Row[], columns: Array<[string, string]>) {
  const cell = (v: unknown) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@-]/, "'")
      .replaceAll('"', '""') +
    '"';
  const csv = [
    columns.map((c) => cell(c[1])).join(","),
    ...rows.map((r) => columns.map((c) => cell(r[c[0]])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "softhaven-current-page.csv";
  a.click();
  URL.revokeObjectURL(url);
}
