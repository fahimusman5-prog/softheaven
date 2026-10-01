import "server-only";
import { z } from "zod";
import { requireAdmin, AccessError } from "./auth";
import { allowed } from "./resources";
const definitions: Record<
  string,
  { table: string; area: string; select: string; order: string; search: string }
> = {
  products: {
    table: "admin_product_catalogue",
    area: "products",
    select: "*",
    order: "updated_at",
    search: "name",
  },
  variants: {
    table: "product_variants",
    area: "products",
    select: "*,products(id,name,image)",
    order: "sort_order",
    search: "color",
  },
  inventory: {
    table: "admin_inventory",
    area: "inventory",
    select: "*",
    order: "stock",
    search: "sku",
  },
  history: {
    table: "inventory_movements",
    area: "inventory",
    select: "*,profiles!inventory_movements_actor_id_fkey(name,email)",
    order: "created_at",
    search: "reason",
  },
  categories: {
    table: "categories",
    area: "products",
    select: "*,products(count)",
    order: "sort_order",
    search: "name",
  },
  collections: {
    table: "collections",
    area: "products",
    select: "*,product_collections(count)",
    order: "sort_order",
    search: "name",
  },
  orders: {
    table: "orders",
    area: "orders",
    select: "*,order_items(count)",
    order: "created_at",
    search: "email",
  },
  customers: {
    table: "profiles",
    area: "customers",
    select: "*",
    order: "created_at",
    search: "email",
  },
  reviews: {
    table: "reviews",
    area: "reviews",
    select:
      "*,products(name,image),profiles!reviews_customer_id_fkey(name,email)",
    order: "created_at",
    search: "body",
  },
  newsletter: {
    table: "newsletter_subscribers",
    area: "marketing",
    select: "id,name,email,status,source,created_at",
    order: "created_at",
    search: "email",
  },
  coupons: {
    table: "coupons",
    area: "marketing",
    select: "*,coupon_redemptions(count)",
    order: "created_at",
    search: "code",
  },
  shipping: {
    table: "shipping_rates",
    area: "settings",
    select: "*,shipping_zones(name,districts,active)",
    order: "created_at",
    search: "name",
  },
  "customer-orders": {
    table: "orders",
    area: "customers",
    select: "*",
    order: "created_at",
    search: "email",
  },
  "customer-addresses": {
    table: "customer_addresses",
    area: "customers",
    select: "*",
    order: "created_at",
    search: "name",
  },
  "customer-reviews": {
    table: "reviews",
    area: "customers",
    select: "*,products(name,image)",
    order: "created_at",
    search: "body",
  },
  "customer-rewards": {
    table: "reward_transactions",
    area: "customers",
    select: "*,orders(order_number)",
    order: "created_at",
    search: "reason",
  },
};
export async function businessGet(path: string, url: URL) {
  const kind = path.slice("business/".length);
  if (kind === "overview") {
    const { db } = await requireAdmin();
    const { data, error } = await db.rpc("admin_overview");
    if (error) throw error;
    return Response.json(data);
  }
  if (kind === "options") {
    const { db, role } = await requireAdmin();
    const target = z
      .enum(["products", "categories", "collections", "customers"])
      .parse(url.searchParams.get("target"));
    if (
      target === "customers"
        ? !allowed(role, "customers") && !allowed(role, "users")
        : !allowed(role, "products") && !allowed(role, "marketing")
    )
      throw new AccessError("Your role cannot view these choices", 403);
    const table = target === "customers" ? "profiles" : target;
    let q = db
      .from(table)
      .select(target === "customers" ? "id,name,email" : "id,name,image")
      .order("name")
      .limit(25);
    const search = (url.searchParams.get("q") ?? "")
      .replace(/[%_,()]/g, "")
      .slice(0, 100);
    if (search)
      q = q.ilike(
        target === "customers" ? "email" : "name",
        "%" + search + "%",
      );
    const ids = url.searchParams.get("ids");
    if (ids) q = q.in("id", ids.split(",").slice(0, 25));
    const { data, error } = await q;
    if (error) throw error;
    return Response.json({ rows: data });
  }
  if (kind === "assignments") {
    const { db } = await requireAdmin("products");
    const collection = url.searchParams.get("collection");
    const product = url.searchParams.get("product");
    if (!collection && !product)
      throw new AccessError("Select a product or collection", 400);
    let query = db
      .from("product_collections")
      .select(
        "product_id,collection_id,products(name,image),collections(name)",
      );
    query = collection
      ? query.eq("collection_id", z.uuid().parse(collection))
      : query.eq("product_id", z.string().min(1).max(200).parse(product));
    const { data, error } = await query.limit(500);
    if (error) throw error;
    return Response.json({ rows: data });
  }
  const config = definitions[kind];
  if (!config) throw new AccessError("Unknown business area", 404);
  const { db } = await requireAdmin(config.area);
  const page = Math.max(
    0,
    Math.min(100000, Math.floor(Number(url.searchParams.get("page")) || 0)),
  );
  let query = db
    .from(config.table)
    .select(config.select, { count: "exact" })
    .order(config.order, {
      ascending: ["sort_order", "stock"].includes(config.order),
    });
  const q = (url.searchParams.get("q") ?? "")
    .slice(0, 100)
    .replace(/[,%_()\\]/g, "");
  if (q) {
    if (kind === "orders")
      query = query.or(
        `email.ilike.%${q}%,phone.ilike.%${q}%,shipping_address->>name.ilike.%${q}%${/^\d+$/.test(q) ? ",order_number.eq." + q : ""}`,
      );
    else if (kind === "customers")
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
      );
    else if (kind === "inventory")
      query = query.or(`sku.ilike.%${q}%,color.ilike.%${q}%`);
    else query = query.ilike(config.search, `%${q}%`);
  }
  if (kind === "inventory") query = query.eq("active", true);
  const status = url.searchParams.get("status");
  if (status) {
    if (["products", "orders", "reviews", "newsletter"].includes(kind))
      query = query.eq("status", status);
    else query = query.eq("active", status === "active");
  }
  const stock = url.searchParams.get("stock");
  if (stock && kind === "products") {
    if (stock === "out") query = query.eq("total_stock", 0);
    else query = query.gt("total_stock", 0);
  }
  if (kind === "inventory" && stock) {
    query = query.eq(
      "stock_state",
      stock === "out"
        ? "out_of_stock"
        : stock === "low"
          ? "low_stock"
          : "in_stock",
    );
  }
  if (url.searchParams.get("category") && kind === "products")
    query = query.eq(
      "category_id",
      z.uuid().parse(url.searchParams.get("category")),
    );
  if (
    url.searchParams.get("product") &&
    ["inventory", "variants"].includes(kind)
  )
    query = query.eq(
      "product_id",
      z.string().min(1).max(200).parse(url.searchParams.get("product")),
    );
  if (kind === "history")
    query = query.eq(
      "variant_id",
      z.uuid().parse(url.searchParams.get("variant")),
    );
  if (kind.startsWith("customer-"))
    query = query.eq(
      "customer_id",
      z.uuid().parse(url.searchParams.get("customer")),
    );
  if (kind === "orders") {
    const payment = url.searchParams.get("payment");
    if (payment) query = query.eq("payment_status", payment);
  }
  if (url.searchParams.get("from"))
    query = query.gte(
      "created_at",
      z.iso.date().parse(url.searchParams.get("from")) + "T00:00:00+05:30",
    );
  if (url.searchParams.get("to"))
    query = query.lte(
      "created_at",
      z.iso.date().parse(url.searchParams.get("to")) + "T23:59:59.999+05:30",
    );
  if (url.searchParams.get("id"))
    query = query.eq("id", url.searchParams.get("id"));
  const { data, error, count } = await query.range(page * 25, page * 25 + 24);
  if (error) throw error;
  let rows: any[] = data ?? [];
  if (kind === "customers" && rows.length) {
    const { data: summaries, error } = await db.rpc("customer_summaries", {
      p_ids: rows.map((r) => r.id),
    });
    if (error) throw error;
    rows = rows.map((r) => ({ ...r, ...summaries?.[r.id] }));
  }

  if (kind === "history") {
    const ids = rows
      .map((r) => r.reference)
      .filter((r) => /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(r ?? ""));
    if (ids.length) {
      const { data: orders } = await db
        .from("orders")
        .select("id,order_number")
        .in("id", ids);
      rows = rows.map((r) => ({
        ...r,
        reference: ids.includes(r.reference)
          ? orders?.find((o) => o.id === r.reference)
            ? "Order #" + orders.find((o) => o.id === r.reference)!.order_number
            : "Order stock movement"
          : r.reference,
      }));
    }
  }
  return Response.json({ rows, count, page, size: 25 });
}
export async function businessPost(path: string, body: unknown) {
  if (path === "business/collection-products") {
    const { db } = await requireAdmin("products");
    const v = z
      .object({
        id: z.uuid(),
        products: z.array(z.string().min(1).max(200)).max(500),
      })
      .parse(body);
    const { error } = await db.rpc("set_collection_products", {
      p_collection: v.id,
      p_products: v.products,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  }
  if (path === "business/product-collections") {
    const { db } = await requireAdmin("products");
    const v = z
      .object({
        id: z.string().min(1).max(200),
        collections: z.array(z.uuid()).max(500),
      })
      .parse(body);
    const { error } = await db.rpc("set_product_collections", {
      p_product: v.id,
      p_collections: v.collections,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  }
  if (path === "business/shipping") {
    const { db } = await requireAdmin("settings");
    const v = z
      .object({
        id: z.uuid().nullable(),
        area: z.string().min(1).max(200),
        districts: z.array(z.string().min(1).max(100)).max(25),
        name: z.string().min(1).max(200),
        rate: z.number().min(0).max(100000000),
        free_over: z.number().min(0).max(100000000).nullable(),
        active: z.boolean(),
      })
      .parse(body);
    const { data, error } = await db.rpc("save_shipping_charge", {
      p_id: v.id,
      p_area: v.area,
      p_districts: v.districts,
      p_name: v.name,
      p_rate: v.rate,
      p_free_over: v.free_over,
      p_active: v.active,
    });
    if (error) throw error;
    return Response.json({ ok: true, id: data });
  }
  throw new AccessError("Unknown action", 404);
}
