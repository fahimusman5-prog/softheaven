"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { AdminIcon } from "./icons";
import { human, type Row } from "./shared";
export function StatusBadge({ value }: { value: unknown }) {
  const text =
    typeof value === "boolean"
      ? value
        ? "active"
        : "inactive"
      : String(value ?? "draft");
  return (
    <span
      className={
        "admin-badge admin-badge--" + text.toLowerCase().replaceAll(" ", "_")
      }
    >
      {human(text)}
    </span>
  );
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-page-heading">
      <div>
        <p className="admin-eyebrow">SoftHaven operations</p>
        <h1>{title}</h1>
        <p className="admin-description">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function MetricCard({
  label,
  value,
  note,
  icon = "reports",
}: {
  label: string;
  value: ReactNode;
  note: string;
  icon?: string;
}) {
  return (
    <article className="admin-metric">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <span className="admin-metric-icon">
        <AdminIcon name={icon} />
      </span>
    </article>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  description = "Records will appear here when they are available.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <AdminIcon name="empty" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="admin-error" role="alert">
      <AdminIcon name="warning" />
      <span>{message}</span>
      <button onClick={retry}>Try again</button>
    </div>
  );
}
export function Skeleton({ metrics = false }: { metrics?: boolean }) {
  return metrics ? (
    <div
      className="admin-metrics"
      aria-label="Loading overview"
      aria-busy="true"
    >
      {[1, 2, 3, 4].map((i) => (
        <div className="admin-skeleton admin-skeleton-metric" key={i} />
      ))}
    </div>
  ) : (
    <div
      className="admin-skeleton-table"
      aria-label="Loading records"
      aria-busy="true"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div className="admin-skeleton" key={i} />
      ))}
    </div>
  );
}
export type Column = {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
};
export function DataTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  caption,
  onRow,
}: {
  columns: Column[];
  rows: Row[];
  emptyTitle?: string;
  emptyDescription?: string;
  caption?: string;
  onRow?: (row: Row) => void;
}) {
  return (
    <div className="admin-table-wrap">
      {rows.length ? (
        <table>
          <caption className="admin-sr-only">
            {caption ?? "Administration records"}
          </caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id ?? i} onClick={onRow ? () => onRow(r) : undefined}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(r) : (r[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
}
export function Pagination({
  page,
  count,
  onPage,
}: {
  page: number;
  count: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="admin-pagination">
      <span>
        {count
          ? `${page * 25 + 1}–${Math.min(count, (page + 1) * 25)} of ${count}`
          : "0 records"}
      </span>
      <div>
        <button
          disabled={!page}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button
          disabled={(page + 1) * 25 >= count}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function AdminTabs({
  items,
  value,
  onChange,
}: {
  items: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="admin-tabs" role="tablist">
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
export function AdminModal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const prior = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      prior?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"admin-modal" + (wide ? " admin-modal--wide" : "")}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const bounds = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < bounds.left ||
            e.clientX > bounds.right ||
            e.clientY < bounds.top ||
            e.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <header>
        <div>
          <p className="admin-eyebrow">SoftHaven administration</p>
          <h2>{title}</h2>
        </div>
        <button onClick={onClose} aria-label="Close dialog">
          <AdminIcon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
  busy,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  return (
    <AdminModal title={title} onClose={onClose}>
      <div className="admin-dialog-copy">
        <p>{description}</p>
      </div>
      <footer className="admin-form-actions">
        <button onClick={onClose}>Cancel</button>
        <button className="admin-danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Updating…" : "Confirm"}
        </button>
      </footer>
    </AdminModal>
  );
}
export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
export function ProductCell({
  name,
  image,
  secondary,
}: {
  name: string;
  image?: string;
  secondary?: ReactNode;
}) {
  return (
    <div className="admin-product-cell">
      {image ? (
        <img src={image} alt="" width="40" height="44" />
      ) : (
        <span className="admin-thumbnail-empty">
          <AdminIcon name="products" />
        </span>
      )}
      <span>
        <strong>{name || "Unnamed product"}</strong>
        {secondary && <small>{secondary}</small>}
      </span>
    </div>
  );
}
