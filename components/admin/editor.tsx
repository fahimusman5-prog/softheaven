"use client";
import { useEffect, useState, type FormEvent } from "react";
import { resources, allowed, type Field } from "@/lib/admin/resources";
import { adminRequest, human, useAdminData, type Row } from "./shared";
import { AdminModal, ErrorState } from "./primitives";
import { AdminIcon } from "./icons";
export function RecordPicker({
  target,
  value,
  onChange,
  multiple = false,
  label = "Choose records",
}: {
  target: string;
  value: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  label?: string;
}) {
  const [search, setSearch] = useState("");
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  const { data, loading, error, refresh } = useAdminData(
    "business/options?" + new URLSearchParams({ target, q: search }),
  );
  const [selected, setSelected] = useState<Row[]>([]);
  const idsKey = ids.join(",");
  useEffect(() => {
    let active = true;
    const currentIds = idsKey ? idsKey.split(",") : [];
    if (currentIds.length) {
      const chunks = [];
      for (let i = 0; i < currentIds.length; i += 25)
        chunks.push(currentIds.slice(i, i + 25));
      Promise.all(
        chunks.map((chunk) =>
          adminRequest(
            "business/options?" +
              new URLSearchParams({ target, ids: chunk.join(",") }),
          ),
        ),
      )
        .then((results) => {
          if (active) setSelected(results.flatMap((r) => r.rows));
        })
        .catch(() => {});
    } else setSelected([]);
    return () => {
      active = false;
    };
  }, [target, idsKey]);
  return (
    <div className="admin-record-picker">
      <input
        type="search"
        placeholder={"Search " + target + "…"}
        aria-label={"Search " + target}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        <select
          aria-label={label}
          value={multiple ? "" : String(value ?? "")}
          onChange={(e) => {
            const id = e.target.value;
            if (multiple) {
              if (id && !ids.includes(id)) onChange([...ids, id]);
            } else onChange(id);
          }}
        >
          <option value="">
            {loading
              ? "Loading choices…"
              : multiple
                ? "Add a selection"
                : label === "Filter by category"
                  ? "All categories"
                  : "Choose an option"}
          </option>
          {[
            ...selected.filter(
              (r) => !data.rows?.some((x: Row) => x.id === r.id),
            ),
            ...(data.rows ?? []),
          ].map((r: Row) => (
            <option key={r.id} value={r.id}>
              {r.name || r.email}
            </option>
          ))}
        </select>
      )}
      {multiple && ids.length > 0 && (
        <div className="admin-selection-chips">
          {ids.map((id, i) => (
            <span key={id}>
              {selected.find((r) => r.id === id)?.name ??
                selected.find((r) => r.id === id)?.email ??
                "Selected record " + (i + 1)}
              <button
                type="button"
                aria-label="Remove selection"
                onClick={() => onChange(ids.filter((x) => x !== id))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
const relations: Record<string, string> = {
  category_id: "categories",
  product_id: "products",
  collection_id: "collections",
  id: "customers",
  product_ids: "products",
  category_ids: "categories",
  collection_ids: "collections",
  customer_ids: "customers",
};
const labels: Record<string, string> = {
  product_ids: "Eligible products",
  category_ids: "Eligible categories",
  collection_ids: "Eligible collections",
  customer_ids: "Eligible customers",
  images: "Gallery images",
  details: "Product highlights",
  earn_per_currency: "Points earned per LKR",
  point_value: "LKR value per point",
  minimum_redemption: "Minimum points to redeem",
  maximum_redemption: "Maximum points per order",
  expiry_days: "Points expire after (days)",
  welcome_bonus: "Welcome bonus (points)",
  review_bonus: "Approved review bonus (points)",
  slug: "URL handle",
  low_stock_threshold: "Low stock alert level",
};
export function validationMessage(resource: string, error: unknown) {
  if (!error || typeof error !== "object" || !("issues" in error))
    return (error as Error).message;
  return Array.from(
    new Set(
      (error as any).issues.map((issue: any) => {
        const key = issue.path[0];
        const label =
          labels[key] ?? resources[resource].fields[key]?.label ?? "Details";
        return (
          label +
          ": " +
          (issue.code === "custom"
            ? issue.message
            : key === "slug"
            ? "Use lowercase words separated by hyphens."
            : issue.code === "too_small"
              ? issue.origin === "string"
                ? issue.minimum === 1
                  ? "This field is required."
                  : "Use at least " + issue.minimum + " characters."
                : "Enter at least " + issue.minimum + "."
              : issue.code === "too_big"
                ? "Reduce this value to the allowed limit."
                : resources[resource].fields[key]?.type === "number"
                  ? "Enter a valid number."
                  : issue.code === "invalid_format"
                    ? "Check the format and try again."
                    : "Enter a valid value.")
        );
      }),
    ),
  ).join(" ");
}
export function initialValues(resource: string, row?: Row) {
  return Object.fromEntries(
    Object.entries(resources[resource].fields).map(([k, f]) => [
      k,
      (f.type === "datetime-local" && row?.[k]
        ? new Date(new Date(row[k]).getTime() + 19800000)
            .toISOString()
            .slice(0, 16)
        : row?.[k]) ??
        (f.type === "checkbox"
          ? false
          : f.type === "json"
            ? []
            : f.type === "select"
              ? (f.options?.[0] ?? "")
              : ""),
    ]),
  );
}
export function normalizeValues(
  resource: string,
  values: Row,
  row?: Row,
  keys?: string[],
) {
  const result: Row = {};
  for (const [key, field] of Object.entries(resources[resource].fields)) {
    if (keys && !keys.includes(key)) continue;
    const value = values[key];
    if (value === "" || value == null) {
      if (field.required) result[key] = "";
      else if (row?.id)
        result[key] = resources[resource].schema.shape[key].isNullable()
          ? null
          : field.type === "number"
            ? undefined
            : "";
      continue;
    }
    result[key] =
      field.type === "number"
        ? Number(value)
        : field.type === "datetime-local"
          ? new Date(
              String(value).length === 16
                ? String(value) + ":00+05:30"
                : String(value),
            ).toISOString()
          : value;
  }
  return resources[resource].schema.parse(result);
}
function ArrayLines({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
}) {
  const [raw, setRaw] = useState(Array.isArray(value) ? value.join("\n") : "");
  return (
    <textarea
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}
export function FormFields({
  resource,
  values,
  onChange,
  fields,
  role,
  hidden = [],
  errors = {},
}: {
  resource: string;
  values: Row;
  onChange: (value: Row) => void;
  fields?: Record<string, Field>;
  role: string;
  hidden?: string[];
  errors?: Record<string, string>;
}) {
  const config = fields ?? resources[resource].fields;
  const update = (key: string, value: unknown) =>
    onChange({ ...values, [key]: value });
  return (
    <>
      {Object.entries(config)
        .filter(([key]) => !hidden.includes(key))
        .map(([key, f]) => {
          const label = labels[key] ?? f.label;
          const relation = relations[key];
          return (
            <label
              className={
                f.type === "textarea" || f.type === "json"
                  ? "admin-field-wide"
                  : ""
              }
              key={key}
            >
              <span>
                {label}
                {f.required && <b> *</b>}
              </span>
              {relation && (key !== "id" || resource === "users") ? (
                key === "customer_ids" &&
                !allowed(role, "customers") &&
                !allowed(role, "users") ? (
                  <small>
                    Customer targeting requires customer-management access.
                  </small>
                ) : (
                  <RecordPicker
                    label={label}
                    target={relation}
                    value={values[key] ?? (f.type === "json" ? [] : "")}
                    multiple={f.type === "json"}
                    onChange={(v) => update(key, v)}
                  />
                )
              ) : f.type === "checkbox" ? (
                <span className="admin-switch-label">
                  <input
                    type="checkbox"
                    checked={Boolean(values[key])}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  <small>{Boolean(values[key]) ? "Enabled" : "Disabled"}</small>
                </span>
              ) : f.type === "select" ? (
                <select
                  value={String(values[key] ?? "")}
                  onChange={(e) => update(key, e.target.value)}
                >
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {human(o)}
                    </option>
                  ))}
                </select>
              ) : f.type === "json" ? (
                <>
                  <ArrayLines
                    value={values[key]}
                    onChange={(v) => update(key, v)}
                  />
                  <small>One item per line.</small>
                </>
              ) : f.type === "textarea" ? (
                <textarea
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={errors[key] ? `field-${key}-error` : undefined}
                  value={String(values[key] ?? "")}
                  onChange={(e) => update(key, e.target.value)}
                />
              ) : (
                <input
                  required={f.required}
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={errors[key] ? `field-${key}-error` : undefined}
                  type={key === "color_hex" ? "color" : f.type ?? "text"}
                  min={f.type === "number" ? 0 : undefined}
                  step={f.type === "number" ? "any" : undefined}
                  value={
                    f.type === "datetime-local"
                      ? String(values[key] ?? "").slice(0, 16)
                      : String(values[key] ?? "")
                  }
                  onChange={(e) => update(key, e.target.value)}
                />
              )}{" "}
              {errors[key] && <small role="alert" id={`field-${key}-error`}>{errors[key]}</small>}
              {key === "slug" && (
                <small>Lowercase words separated by hyphens.</small>
              )}
              {[
                "product_ids",
                "category_ids",
                "collection_ids",
                "customer_ids",
              ].includes(key) && (
                <small>Leave empty to include all {relations[key]}.</small>
              )}
            </label>
          );
        })}
    </>
  );
}
export function ResourceEditor({
  resource,
  row,
  role,
  onClose,
  onSaved,
  fixed = {},
}: {
  resource: string;
  row?: Row;
  role: string;
  onClose: () => void;
  onSaved: (id: string) => void;
  fixed?: Row;
}) {
  const [values, setValues] = useState<Row>({
    ...initialValues(resource, row),
    ...fixed,
  });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const title = resources[resource].title;
  const close = () => {
    if (!dirty || confirm("Discard your unsaved changes?")) onClose();
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const normalized = normalizeValues(resource, values, row);
      const result = await adminRequest(resource, {
        id: row?.id,
        values: normalized,
      });
      setDirty(false);
      onSaved(result.id ?? String(row?.id));
    } catch (e) {
      setError(validationMessage(resource, e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <AdminModal
      title={(row?.id ? "Edit " : "Add ") + title.toLowerCase()}
      onClose={close}
    >
      <form onSubmit={save}>
        {resource === "reviews" && row && (
          <div className="admin-dialog-copy">
            <h3>{row.products?.name}</h3>
            <p>
              {row.profiles?.name || row.profiles?.email || "Customer"} ·{" "}
              {row.rating}/5
            </p>
            <strong>{row.title}</strong>
            <p>{row.body}</p>
          </div>
        )}
        <div className="admin-form-grid">
          <FormFields
            resource={resource}
            values={values}
            onChange={(v) => {
              setValues(v);
              setDirty(true);
            }}
            role={role}
            hidden={Object.keys(fixed)}
          />
        </div>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <footer className="admin-form-actions">
          <button type="button" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </form>
    </AdminModal>
  );
}
export function ImageUpload({ onUploaded, role, onBusyChange }: { onUploaded: (url: string) => void; role: string; onBusyChange?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  if (!allowed(role, 'media')) return null;
  async function upload(files: File[]) {
    if (busy || !files.length) return;
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      if (files.length > 30) throw new Error('Choose up to 30 images at a time.');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Use JPEG, PNG, WebP or AVIF images under 5 MB.');
        const form = new FormData(); form.set('file', file);
        const url = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest(); xhr.open('POST', '/api/admin/media-upload'); xhr.timeout = 60000;
          xhr.upload.onprogress = event => setProgress('Image ' + (i + 1) + ' of ' + files.length + ': ' + (event.lengthComputable ? Math.round(event.loaded / event.total * 100) + '%' : 'uploading…'));
          xhr.onload = () => { try { const result = JSON.parse(xhr.responseText); if (xhr.status < 200 || xhr.status >= 300 || !result.url) throw new Error(); resolve(result.url); } catch { reject(new Error('Image upload failed. Check your permission, file format and size.')); } };
          xhr.onerror = xhr.ontimeout = () => reject(new Error('Upload interrupted. Please try again.'));
          xhr.send(form);
        });
        onUploaded(url);
      }
      setProgress('Images uploaded. Save the product to keep your changes.');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <div className="admin-image-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void upload(Array.from(e.dataTransfer.files)); }}>
    <label className="admin-upload-control"><AdminIcon name="plus" /><span>{busy ? 'Uploading images…' : 'Drop images here or choose files'}</span>
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ''; void upload(files); }} />
    </label>
    <small role="status">{progress}</small>{error && <small role="alert">{error}</small>}
  </div>;
}
