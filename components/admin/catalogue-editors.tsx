"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resources, allowed } from "@/lib/admin/resources";
import { adminRequest, useAdminData, type Row, money } from "./shared";
import {
  PageHeader,
  Panel,
  AdminTabs,
  DataTable,
  StatusBadge,
  Skeleton,
  ErrorState,
  EmptyState,
  Pagination,
} from "./primitives";
import {
  FormFields,
  initialValues,
  normalizeValues,
  validationMessage,
  ResourceEditor,
  RecordPicker,
  ImageUpload,
} from "./editor";
import { ProductInventory } from "./stock";
export function Assignments({
  id,
  collection = false,
}: {
  id: string;
  collection?: boolean;
}) {
  const { data, loading, error, refresh } = useAdminData(
    "business/assignments?" +
      new URLSearchParams({ [collection ? "collection" : "product"]: id }),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(
    () =>
      setSelected(
        (data.rows ?? []).map((r: Row) =>
          String(r[collection ? "product_id" : "collection_id"]),
        ),
      ),
    [data, collection],
  );
  return (
    <Panel title={collection ? "Products in this collection" : "Collections"}>
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        <>
          <RecordPicker
            label={collection ? "Select products" : "Select collections"}
            target={collection ? "products" : "collections"}
            multiple
            value={selected}
            onChange={setSelected}
          />
          <p className="admin-helper">
            {selected.length} selected. Search to add records; remove a
            selection to unassign it.
          </p>
          <button
            className="admin-primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await adminRequest(
                  "business/" +
                    (collection
                      ? "collection-products"
                      : "product-collections"),
                  { id, [collection ? "products" : "collections"]: selected },
                );
                setNotice("Assignments saved.");
                refresh();
              } catch (e) {
                setNotice((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : "Save assignments"}
          </button>
          {notice && <p role="status">{notice}</p>}
        </>
      )}
    </Panel>
  );
}
function Variants({ id, role }: { id: string; role: string }) {
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useAdminData(
    "business/variants?" +
      new URLSearchParams({ product: id, page: String(page) }),
  );
  const [edit, setEdit] = useState<Row | null>(null);
  return (
    <Panel
      title="Colours & variants"
      action={
        <button
          className="admin-primary"
          onClick={() =>
            setEdit({ active: true, low_stock_threshold: 5, sort_order: 0 })
          }
        >
          Add variant
        </button>
      }
    >
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        <>
          <DataTable
            rows={data.rows ?? []}
            columns={[
              {
                key: "color",
                label: "Colour",
                render: (r) => (
                  <span className="admin-colour">
                    <i style={{ background: r.color_hex || "#ddd" }} />
                    {r.color}
                  </span>
                ),
              },
              { key: "sku", label: "SKU" },
              {
                key: "price",
                label: "Price",
                render: (r) =>
                  r.price == null ? "Product price" : money(r.price),
              },
              { key: "stock", label: "Stock" },
              {
                key: "active",
                label: "Status",
                render: (r) => <StatusBadge value={r.active} />,
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <button onClick={() => setEdit(r)}>Edit variant</button>
                ),
              },
            ]}
          />
          <Pagination page={page} count={data.count ?? 0} onPage={setPage} />
        </>
      )}
      {edit && (
        <ResourceEditor
          resource="variants"
          row={edit}
          fixed={{ product_id: id }}
          role={role}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refresh();
          }}
        />
      )}
    </Panel>
  );
}
const productTabs: Record<string, string[]> = {
  general: [
    "name",
    "slug",
    "description",
    "short_description",
    "details",
    "status",
  ],
  media: ["image", "images"],
  pricing: ["sku", "price", "compare_at", "cost_price"],
  organization: ["category_id", "featured", "new_arrival", "best_seller"],
  seo: ["seo_title", "seo_description"],
};
export function CatalogueEditor({
  resource,
  id,
  role,
}: {
  resource: "products" | "collections";
  id: string;
  role: string;
}) {
  const isNew = id === "new";
  const { data, loading, error, refresh } = useAdminData(
    isNew
      ? "business/options?target=" + resource
      : "business/" + resource + "?id=" + encodeURIComponent(id),
  );
  const [values, setValues] = useState<Row>(initialValues(resource));
  const [tab, setTab] = useState("general");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const row = isNew ? undefined : data.rows?.[0];
  useEffect(() => {
    if (row) {
      setValues(initialValues(resource, row));
      setDirty(false);
    }
  }, [row, resource]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const leave = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (
        dirty &&
        anchor &&
        anchor.target !== "_blank" &&
        anchor.href !== window.location.href &&
        !confirm("Discard your unsaved product changes?")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", leave, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", leave, true);
    };
  }, [dirty]);
  const tabs =
    resource === "products"
      ? [
          ["general", "General"],
          ["media", "Media"],
          ["pricing", "Pricing"],
          ["variants", "Colours & variants"],
          ["inventory", "Inventory"],
          ["organization", "Organization"],
          ["seo", "SEO"],
        ]
      : [
          ["general", "General"],
          ["products", "Products"],
          ["seo", "SEO"],
        ];
  const fields =
    resource === "products"
      ? (productTabs[tab] ?? [])
      : tab === "seo"
        ? ["seo_title", "seo_description"]
        : [
            "name",
            "slug",
            "description",
            "image",
            "active",
            "featured",
            "sort_order",
          ];
  async function save() {
    setBusy(true);
    setNotice("");
    try {
      const result = await adminRequest(resource, {
        id: isNew ? undefined : id,
        values: normalizeValues(resource, values, row),
      });
      setDirty(false);
      setNotice("Changes saved.");
      if (isNew)
        router.replace(
          "/admin/" + resource + "/" + encodeURIComponent(result.id),
        );
      else refresh();
    } catch (e) {
      setNotice(validationMessage(resource, e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link
        className="admin-back"
        href={"/admin/" + resource}
        onClick={(e) => {
          if (e.defaultPrevented) return;
        }}
      >
        ← Back to {resource}
      </Link>
      <PageHeader
        title={
          isNew
            ? "Add " + (resource === "products" ? "product" : "collection")
            : row?.name || "Edit " + resource
        }
        description="Keep product information accurate and ready for your customers."
        action={
          <button className="admin-primary" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        }
      />
      {!isNew && loading ? (
        <Skeleton />
      ) : !isNew && error ? (
        <ErrorState message={error} retry={refresh} />
      ) : !isNew && !row ? (
        <EmptyState title="Record not found" />
      ) : (
        <>
          <AdminTabs
            value={tab}
            onChange={setTab}
            items={tabs
              .filter(
                ([key]) => key !== "inventory" || allowed(role, "inventory"),
              )
              .map(([id, label]) => ({ id, label }))}
          />
          {notice && (
            <p className="admin-notice" role="status">
              {notice}
            </p>
          )}
          {tab === "variants" || tab === "inventory" || tab === "products" ? (
            isNew ? (
              <EmptyState
                title="Save the basics first"
                description="Save this record before adding its variants, stock or assigned products."
              />
            ) : tab === "variants" ? (
              <Variants id={id} role={role} />
            ) : tab === "inventory" ? (
              <ProductInventory product={id} />
            ) : (
              <Assignments id={id} collection />
            )
          ) : (
            <Panel title={tabs.find(([key]) => key === tab)?.[1] || "Details"}>
              <form
                className="admin-form-grid"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <FormFields
                  resource={resource}
                  fields={Object.fromEntries(
                    fields.map((k) => [k, resources[resource].fields[k]]),
                  )}
                  values={values}
                  role={role}
                  onChange={(v) => {
                    setValues(v);
                    setDirty(true);
                  }}
                />
                {tab === "media" && (
                  <div className="admin-field-wide">
                    <ImageUpload
                      role={role}
                      onUploaded={(url) => {
                        setValues((v) => ({
                          ...v,
                          image: v.image || url,
                          images: [...(v.images ?? []), url],
                        }));
                        setDirty(true);
                      }}
                    />
                    <div className="admin-gallery">
                      {[values.image, ...(values.images ?? [])]
                        .filter(Boolean)
                        .map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Product preview"
                            width="100"
                            height="110"
                          />
                        ))}
                    </div>
                  </div>
                )}
              </form>
            </Panel>
          )}
          {tab === "organization" && !isNew && <Assignments id={id} />}
        </>
      )}
    </>
  );
}
