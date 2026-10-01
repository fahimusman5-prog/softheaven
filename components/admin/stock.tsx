"use client";
import { useState, type FormEvent } from "react";
import { adminRequest, date, human, useAdminData, type Row } from "./shared";
import {
  AdminModal,
  DataTable,
  ErrorState,
  Pagination,
  Panel,
  ProductCell,
  Skeleton,
  StatusBadge,
} from "./primitives";
export function stockState(row: Row) {
  return row.stock === 0
    ? "out_of_stock"
    : row.stock <= row.low_stock_threshold
      ? "low_stock"
      : "in_stock";
}
export function StockAdjustment({
  row,
  onClose,
  onSaved,
}: {
  row: Row;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [direction, setDirection] = useState("increase");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("stock received");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100000) {
      setError("Enter a whole quantity between 1 and 100,000.");
      return;
    }
    if (direction === "decrease" && amount > row.stock) {
      setError("You cannot remove more units than the current stock.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminRequest("inventory/adjust", {
        variant: row.id,
        delta: direction === "increase" ? amount : -amount,
        reason,
        reference: notes || undefined,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminModal title="Adjust stock" onClose={onClose}>
      <div className="admin-dialog-copy">
        <ProductCell
          name={row.products?.name}
          image={row.products?.image}
          secondary={row.color + " · " + (row.sku || "No SKU")}
        />
        <p>
          Current stock: <strong>{row.stock} units</strong>
        </p>
      </div>
      <form onSubmit={submit}>
        <div className="admin-form-grid">
          <label>
            Adjustment
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="increase">Increase stock</option>
              <option value="decrease">Decrease stock</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max="100000"
              step="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label>
            Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {[
                ["stock received", "Stock received"],
                ["manual correction", "Correction"],
                ["return/restock", "Returned"],
                ["damage", "Damaged"],
                ["other", "Other"],
              ].map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Notes / reference
            <input
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div className="admin-adjustment-preview">
          New stock:{" "}
          <strong>
            {Math.max(
              0,
              Number(row.stock) +
                (direction === "increase" ? 1 : -1) * Number(quantity || 0),
            )}{" "}
            units
          </strong>
        </div>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <footer className="admin-form-actions">
          <button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Updating…" : "Update stock"}
          </button>
        </footer>
      </form>
    </AdminModal>
  );
}
export function StockHistory({
  row,
  onClose,
}: {
  row: Row;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useAdminData(
    "business/history?" +
      new URLSearchParams({ variant: row.id, page: String(page) }),
  );
  return (
    <AdminModal title="Stock history" onClose={onClose} wide>
      <div className="admin-dialog-copy">
        <ProductCell
          name={row.products?.name}
          image={row.products?.image}
          secondary={row.color + " · " + (row.sku || "No SKU")}
        />
      </div>
      {error ? (
        <ErrorState message={error} retry={refresh} />
      ) : loading ? (
        <Skeleton />
      ) : (
        <>
          <DataTable
            columns={[
              {
                key: "date",
                label: "Date",
                render: (r) => date(r.created_at, true),
              },
              {
                key: "quantity_change",
                label: "Change",
                render: (r) => (
                  <span
                    className={
                      r.quantity_change > 0
                        ? "admin-positive"
                        : "admin-negative"
                    }
                  >
                    {r.quantity_change > 0 ? "+" : ""}
                    {r.quantity_change}
                  </span>
                ),
              },
              { key: "previous_quantity", label: "Before" },
              { key: "new_quantity", label: "After" },
              {
                key: "reason",
                label: "Reason",
                render: (r) => (
                  <span>
                    {human(r.reason)}
                    <small className="admin-cell-secondary">
                      {r.reference}
                    </small>
                  </span>
                ),
              },
              {
                key: "admin",
                label: "Admin",
                render: (r) =>
                  r.profiles?.name ||
                  r.profiles?.email ||
                  (r.actor_id ? "Administrator" : "System"),
              },
            ]}
            rows={data.rows ?? []}
            emptyTitle="No stock changes yet"
            emptyDescription="Stock received, corrections and order movements will appear here."
          />
          <Pagination page={page} count={data.count ?? 0} onPage={setPage} />
        </>
      )}
    </AdminModal>
  );
}
export function ProductInventory({ product }: { product: string }) {
  const { data, loading, error, refresh } = useAdminData(
    "business/inventory?" + new URLSearchParams({ product }),
  );
  const [adjust, setAdjust] = useState<Row | null>(null);
  const [history, setHistory] = useState<Row | null>(null);
  return (
    <>
      <Panel title="Inventory by colour">
        {error ? (
          <ErrorState message={error} retry={refresh} />
        ) : loading ? (
          <Skeleton />
        ) : (
          <DataTable
            rows={data.rows ?? []}
            columns={[
              { key: "color", label: "Variant" },
              { key: "sku", label: "SKU" },
              { key: "stock", label: "Stock" },
              {
                key: "status",
                label: "Status",
                render: (r) => <StatusBadge value={stockState(r)} />,
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="admin-row-actions">
                    <button onClick={() => setAdjust(r)}>Adjust stock</button>
                    <button
                      className="admin-ghost"
                      onClick={() => setHistory(r)}
                    >
                      History
                    </button>
                  </div>
                ),
              },
            ]}
            emptyTitle="Add a colour variant first"
            emptyDescription="Each variant has its own stock and history."
          />
        )}
      </Panel>
      {adjust && (
        <StockAdjustment
          row={adjust}
          onClose={() => setAdjust(null)}
          onSaved={() => {
            setAdjust(null);
            refresh();
          }}
        />
      )}
      {history && (
        <StockHistory row={history} onClose={() => setHistory(null)} />
      )}
    </>
  );
}
