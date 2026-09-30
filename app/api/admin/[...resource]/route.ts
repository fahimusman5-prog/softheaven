import { validateSettings } from '@/lib/admin/settings';
import { resources } from '@/lib/admin/resources';
import {
  requireAdmin,
  sameOrigin,
  apiError,
  AccessError,
} from '@/lib/admin/auth';
import { z } from 'zod';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  try {
    const path = (await params).resource.join('/');
    const url = new URL(request.url);
    if (path === 'dashboard') {
      const { db } = await requireAdmin();
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      const { data, error } = await db.rpc('dashboard', {
        ...(from ? { p_from: z.iso.datetime().parse(from) } : {}),
        ...(to ? { p_to: z.iso.datetime().parse(to) } : {}),
      });
      if (error) throw error;
      if (url.searchParams.get('reports') === 'true') {
        const { error: reportError, data: reports } = await db.rpc(
          'commerce_reports',
          {
            p_from: from ?? new Date(Date.now() - 30 * 86400000).toISOString(),
            p_to: to ?? new Date().toISOString(),
          },
        );
        if (reportError) throw reportError;
        return Response.json({ ...data, reports });
      }
      return Response.json(data);
    }
    const config = resources[path];
    if (!config) throw new AccessError('Unknown resource', 404);
    const { db } = await requireAdmin(config.area);
    const page = Math.max(
      0,
      Math.min(100000, Number(url.searchParams.get('page')) || 0),
    );
    const size = 25;
    let query = db
      .from(config.table)
      .select('*', { count: 'exact' })
      .order(
        config.columns.includes(url.searchParams.get('sort') ?? '') &&
          url.searchParams.get('sort') !== 'read'
          ? url.searchParams.get('sort')!
          : config.columns.includes('created_at')
            ? 'created_at'
            : config.columns.includes('sort_order')
              ? 'sort_order'
              : config.columns[0],
        {
          ascending: url.searchParams.has('ascending')
            ? url.searchParams.get('ascending') === 'true'
            : !config.columns.includes('created_at'),
        },
      );
    if (
      ['variants', 'inventory'].includes(path) &&
      url.searchParams.get('product_id')
    )
      query = query.eq('product_id', url.searchParams.get('product_id'));
    const id = url.searchParams.get('id');
    if (id) query = query.eq('id', id);
    const search = url.searchParams.get('q')?.slice(0, 150);
    if (search)
      query = query.ilike(config.search, `%${search.replace(/[%_]/g, '')}%`);
    const filter = url.searchParams.get('status');
    if (filter && config.columns.includes('status'))
      query = query.eq('status', filter);
    const { data, error, count } = await query.range(
      page * size,
      page * size + size - 1,
    );
    if (error) throw error;
    if (path === 'notifications' && data?.length) {
      const { user } = await requireAdmin();
      const { data: reads } = await db
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);
      data.forEach((n) => {
        n.read = Boolean(reads?.some((r) => r.notification_id === n.id));
      });
    }
    if (path === 'customers' && data?.length) {
      const { data: notes } = await db
        .from('admin_customer_notes')
        .select('*')
        .in(
          'customer_id',
          data.map((c) => c.id),
        );
      data.forEach((c) => {
        c.notes = notes?.find((n) => n.customer_id === c.id)?.notes ?? null;
      });
    }
    if (path === 'orders' && id) {
      const [items, events] = await Promise.all([
        db.from('order_items').select('*').eq('order_id', id),
        db
          .from('order_events')
          .select('*')
          .eq('order_id', id)
          .order('created_at'),
      ]);
      const { data: notes } = await db
        .from('admin_order_notes')
        .select('notes')
        .eq('order_id', id)
        .maybeSingle();
      return Response.json({
        rows: data?.map((o) => ({ ...o, admin_notes: notes?.notes ?? null })),
        count,
        items: items.data,
        events: events.data,
      });
    }
    if (path === 'customers' && id) {
      const [orders, addresses, rewards, reviews] = await Promise.all([
        db
          .from('orders')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false })
          .limit(25),
        db
          .from('customer_addresses')
          .select('*')
          .eq('customer_id', id)
          .limit(25),
        db
          .from('reward_transactions')
          .select('*')
          .eq('customer_id', id)
          .limit(25),
        db.from('reviews').select('*').eq('customer_id', id).limit(25),
      ]);
      const { data: summary } = await db.rpc('customer_summary', {
        p_customer: id,
      });
      return Response.json({
        rows: data,
        count,
        summary,
        orders: orders.data,
        addresses: addresses.data,
        rewards: rewards.data,
        reviews: reviews.data,
      });
    }
    return Response.json({ rows: data, count, page, size });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  try {
    sameOrigin(request);
    const path = (await params).resource.join('/');
    const body = await request.json();
    if (path === 'notifications/read') {
      const { db, user } = await requireAdmin();
      const id = z.uuid().parse(body.id);
      const { error } = await db
        .from('notification_reads')
        .insert({ notification_id: id, user_id: user.id });
      if (error && error.code !== '23505') throw error;
      return Response.json({ ok: true });
    }
    if (path === 'media/remove') {
      const { db } = await requireAdmin('media');
      const id = z.uuid().parse(body.id);
      const { data: asset, error: readError } = await db
        .from('media_assets')
        .select('*')
        .eq('id', id)
        .single();
      if (readError) throw readError;
      const { error } = await db.from('media_assets').delete().eq('id', id);
      if (error) throw error;
      const { error: storageError } = await db.storage
        .from('store-media')
        .remove([asset.path]);
      if (storageError) {
        await db.from('media_assets').insert(asset);
        throw storageError;
      }
      return Response.json({ ok: true });
    }
    if (path === 'products/bulk') {
      const { db } = await requireAdmin('products');
      const v = z
        .object({
          ids: z.array(z.string().min(1)).min(1).max(25),
          action: z.enum(['published', 'draft', 'archived', 'featured']),
        })
        .parse(body);
      const { error } = await db
        .from('products')
        .update(
          v.action === 'featured' ? { featured: true } : { status: v.action },
        )
        .in('id', v.ids);
      if (error) throw error;
      return Response.json({ ok: true });
    }
    if (path === 'inventory/adjust') {
      const { db } = await requireAdmin('inventory');
      const v = z
        .object({
          variant: z.uuid(),
          delta: z.number().int().min(-100000).max(100000),
          reason: z.enum([
            'stock received',
            'manual correction',
            'return/restock',
            'damage',
            'other',
          ]),
          reference: z.string().max(200).optional(),
        })
        .parse(body);
      const { data, error } = await db.rpc('adjust_inventory', {
        p_variant: v.variant,
        p_delta: v.delta,
        p_reason: v.reason,
        p_reference: v.reference ?? null,
      });
      if (error) throw error;
      return Response.json({ stock: data });
    }
    if (path === 'rewards/adjust') {
      const { db } = await requireAdmin('rewards');
      const v = z
        .object({
          customer: z.uuid(),
          points: z.number().int().min(-1000000).max(1000000),
          reason: z.string().min(3).max(500),
        })
        .parse(body);
      const { error } = await db.rpc('adjust_rewards', {
        p_customer: v.customer,
        p_points: v.points,
        p_reason: v.reason,
      });
      if (error) throw error;
      return Response.json({ ok: true });
    }
    if (path === 'orders/refund') {
      const { db } = await requireAdmin('settings');
      const v = z
        .object({
          id: z.uuid(),
          reference: z.string().min(3).max(200),
          reason: z.string().min(3).max(2000),
        })
        .parse(body);
      const { error } = await db.rpc('record_cod_refund', {
        p_order: v.id,
        p_reference: v.reference,
        p_reason: v.reason,
      });
      if (error) throw error;
      return Response.json({ ok: true });
    }
    if (path === 'orders/update') {
      const { db } = await requireAdmin('orders');
      const v = z
        .object({
          id: z.uuid(),
          status: z.string(),
          notes: z.string().max(2000).nullable(),
          tracking: z.string().max(200).nullable(),
          provider: z.string().max(200).nullable(),
          cod_paid: z.boolean(),
        })
        .parse(body);
      const { error } = await db.rpc('update_order', {
        p_order: v.id,
        p_status: v.status,
        p_notes: v.notes,
        p_tracking: v.tracking,
        p_provider: v.provider,
        p_cod_paid: v.cod_paid,
      });
      if (error) throw error;
      return Response.json({ ok: true });
    }
    const config = resources[path];
    if (!config || config.readonly)
      throw new AccessError('Resource cannot be edited', 403);
    const { db } = await requireAdmin(config.area);
    const id = body.id as string | undefined;
    const values = config.schema.parse(body.values);
    if (
      !id &&
      [
        'reviews',
        'newsletter',
        'settings',
        'reward-settings',
        'media',
        'content/homepage',
        'customers',
      ].includes(path)
    )
      throw new AccessError('Edit an existing record', 400);
    if (path === 'settings') {
      if (!id) throw new Error('Select settings to edit');
      values.value = validateSettings(id, values.value);
    }
    if (path === 'customers') {
      if (!id) throw new Error('Select an existing customer');
      const v = values as {
        name: string;
        phone?: string | null;
        notes?: string | null;
        active: boolean;
      };
      const { error } = await db.rpc('update_customer', {
        p_customer: id,
        p_name: v.name,
        p_phone: v.phone ?? '',
        p_notes: v.notes ?? '',
        p_active: v.active,
      });
      if (error) throw error;
      return Response.json({ ok: true, id });
    }
    const query = id
      ? db.from(config.table).update(values).eq('id', id)
      : db.from(config.table).insert(values);
    const { data, error } = await query.select('id').single();
    if (error) throw error;
    return Response.json({ ok: true, id: data.id });
  } catch (e) {
    return apiError(e);
  }
}
