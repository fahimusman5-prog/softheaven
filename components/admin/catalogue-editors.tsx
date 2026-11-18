"use client";
import Link from "next/link";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
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
function TabbedCatalogueEditor({
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

/** Products share one structured editor for creation and updates. Collections retain their workflow. */
export function CatalogueEditor(props: { resource: 'products' | 'collections'; id: string; role: string }) {
  return props.resource === 'products' ? <ProductEditor id={props.id} role={props.role} /> : <TabbedCatalogueEditor {...props} />;
}
const productSections = [
  ['basic', 'Basic Product Information', ['name', 'slug', 'description', 'short_description', 'details']],
  ['images', 'Product Images', []],
  ['variants', 'Colours & Variants', []],
  ['pricing', 'Pricing', ['price', 'compare_at', 'cost_price']],
  ['inventory', 'Inventory', ['sku']],
  ['organization', 'Categories & Collections', ['category_id', 'featured', 'new_arrival', 'best_seller']],
  ['seo', 'SEO', ['seo_title', 'seo_description']],
  ['publishing', 'Publishing Settings', ['status']],
] as const;
function productHandle(name: string) { return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function ProductEditor({ id, role }: { id: string; role: string }) {
  const isNew = id === 'new';
  const { data, loading, error, refresh } = useAdminData(isNew ? 'business/options?target=products' : 'business/products?id=' + encodeURIComponent(id));
  const row = isNew ? undefined : data.rows?.[0];
  const [values, setValues] = useState<Row>(() => initialValues('products'));
  const [dirty, setDirty] = useState(false);
  const [manualSlug, setManualSlug] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const saving = useRef(false);
  const [notice, setNotice] = useState('');
  const [failed, setFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const router = useRouter();
  useEffect(() => {
    setValues(initialValues('products', row)); setDirty(false); setManualSlug(Boolean(row));
  }, [row, id]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    const leave = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a');
      if (dirty && anchor && anchor.target !== '_blank' && anchor.origin === location.origin && anchor.pathname !== location.pathname && !confirm('Discard your unsaved product changes?')) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener('beforeunload', unload); document.addEventListener('click', leave, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', leave, true); };
  }, [dirty]);
  function change(next: Row) {
    if (next.slug !== values.slug) setManualSlug(true);
    if (!manualSlug && next.name !== values.name) next = { ...next, slug: productHandle(next.name) };
    setValues(next); setDirty(true); setFieldErrors({});
  }
  async function save(status?: string) {
    if (saving.current || uploadBusy) return;
    saving.current = true; setBusy(true); setNotice(''); setFailed(false); setFieldErrors({});
    try {
      const next: Row = { ...values, ...(status ? { status } : {}) };
      // Empty prices may be retained as zero only for an explicitly saved draft.
      if (next.status === 'draft' && next.price === '') next.price = 0;
      const normalized = normalizeValues('products', next, row);
      const result = await adminRequest('products', { id: isNew ? undefined : id, values: normalized });
      setDirty(false); setValues(next); setNotice('Product saved.');
      if (isNew) router.replace('/admin/products/' + encodeURIComponent(result.id));
    } catch (e) { if (e instanceof z.ZodError) setFieldErrors(Object.fromEntries(e.issues.map(issue => [String(issue.path[0]), issue.message]))); setFailed(true); setNotice(validationMessage('products', e)); }
    finally { saving.current = false; setBusy(false); }
  }
  function images() { return Array.from(new Set([values.image, ...(values.images ?? [])].filter(Boolean))) as string[]; }
  function gallery(next: string[]) { change({ ...values, image: next[0] || '', images: next.slice(1) }); }
  if (!isNew && loading) return <Skeleton />;
  if (error) return <ErrorState message={error} retry={refresh} />;
  if (!isNew && !row) return <EmptyState title="Product not found" />;
  return <div className="admin-product-editor">
    <Link className="admin-back" href="/admin/products">← Back to products</Link>
    <PageHeader title={isNew ? 'Add product' : row?.name || 'Edit product'} description="Work through the sections below. Save a draft before adding variants and stock." />
    <nav className="admin-product-sections" aria-label="Product sections">{productSections.map(([key, title]) => <a key={key} href={'#product-' + key}>{title}</a>)}</nav>
    <fieldset disabled={busy} className="admin-product-fields">{productSections.map(([key, title, fields], index) => <section id={'product-' + key} key={key} className="admin-product-section" aria-label={title}>
      <Panel title={(index + 1) + '. ' + title}>
        {fields.length > 0 && <div className="admin-form-grid"><FormFields resource="products" fields={Object.fromEntries(fields.map(field => [field, resources.products.fields[field]]))} values={values} role={role} onChange={change} errors={fieldErrors} /></div>}
        {key === 'images' && <>
          <p className="admin-helper">Drop or choose images to upload. The first image is the cover. Removing an image here only detaches it from this product.</p>
          <ImageUpload role={role} onBusyChange={setUploadBusy} onUploaded={url => { setDirty(true); setValues(v => { const all = Array.from(new Set([v.image, ...(v.images ?? []), url].filter(Boolean))); return { ...v, image: all[0], images: all.slice(1) }; }); }} />
          <div className="admin-product-gallery">{images().map((url, i, all) => <figure key={url}><img src={url} alt={'Product image ' + (i + 1)} width={140} height={140} /><figcaption>{i === 0 ? 'Cover image' : 'Gallery image ' + i}</figcaption><div>
            <button type="button" disabled={i === 0} onClick={() => gallery([url, ...all.filter(x => x !== url)])}>Use as cover</button>
            <button type="button" disabled={i === 0} aria-label={'Move image ' + (i + 1) + ' earlier'} onClick={() => { const next = [...all]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; gallery(next); }}>←</button>
            <button type="button" disabled={i === all.length - 1} aria-label={'Move image ' + (i + 1) + ' later'} onClick={() => { const next = [...all]; [next[i + 1], next[i]] = [next[i], next[i + 1]]; gallery(next); }}>→</button>
            <button type="button" onClick={() => gallery(all.filter(x => x !== url))}>Remove</button>
          </div></figure>)}</div>
        </>}
        {key === 'variants' && (isNew ? <p>Save a draft first, then add colours and variants here. Every purchasable item needs a stock record; use a single “Standard” variant for a simple product.</p> : <Variants id={id} role={role} />)}
        {key === 'pricing' && <p className="admin-helper">Price is the amount charged in LKR. Compare-at price is the regular price before a discount and must be at least the selling price. Variant overrides are edited above.</p>}
        {key === 'inventory' && (isNew ? <p>Save a draft and add a variant to receive stock.</p> : allowed(role, 'inventory') ? <ProductInventory product={id} /> : <p>Stock adjustments require inventory permission.</p>)}
        {key === 'organization' && (!isNew ? <Assignments id={id} /> : <p>Collections can be assigned here after the first draft is saved.</p>)}
        {key === 'seo' && <p className="admin-helper">Optional. The storefront falls back to product information. Title: {String(values.seo_title || '').length}/60 suggested characters. Description: {String(values.seo_description || '').length}/160 suggested characters.</p>}
        {key === 'publishing' && <p className="admin-helper">Drafts stay private. Publishing requires a description, image, category and valid price. Stock and active variants control whether customers can purchase.</p>}
      </Panel>
    </section>)}</fieldset>
    <footer className="admin-product-save" aria-busy={busy}>
      <span role={failed ? 'alert' : 'status'}>{notice || (dirty ? 'Unsaved changes' : isNew ? 'New draft' : 'All changes saved')}</span>
      <button type="button" disabled={busy || uploadBusy} onClick={() => save('draft')}>Save Draft</button>
      <button type="button" disabled={busy || uploadBusy} onClick={() => save()}>Save Changes</button>
      <button type="button" className="admin-primary" disabled={busy || uploadBusy} onClick={() => save('published')}>{busy ? 'Saving…' : 'Publish Product'}</button>
    </footer>
  </div>;
}
