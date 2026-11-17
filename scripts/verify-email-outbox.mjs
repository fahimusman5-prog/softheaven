// Isolated PostgreSQL/WASM regression test. Never connects to hosted Supabase.
// Install @electric-sql/pglite outside the checkout, then set PGLITE_MODULE to its entry path.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema private;
    create table public.orders(id uuid primary key,order_number bigint,email text,phone text,created_at timestamptz default now(),shipping_address jsonb,subtotal numeric,discount numeric,shipping numeric,total numeric,payment_method text,payment_status text,status text);
    create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid references public.orders,name text,color text,sku text,quantity integer,unit_price numeric);`);
  const migration = (await fs.readdir('supabase/migrations')).find(f => f.endsWith('_launch_order_email_outbox.sql'));
  await db.exec(await fs.readFile('supabase/migrations/' + migration, 'utf8'));
  async function order(id, method = 'cod') {
    await db.exec(`begin;
      insert into public.orders values('${id}',42,'test@example.com','test',now(),'{}',100,0,20,120,'${method}','pending','pending');
      insert into public.order_items(order_id,name,color,quantity,unit_price) values('${id}','Teddy','Cream',1,100);
      commit;`);
  }
  const count = async () => Number((await db.query('select count(*) n from private.order_email_outbox')).rows[0].n);
  const id='11111111-1111-4111-8111-111111111111';
  await order(id); assert.equal(await count(), 2);
  const snapshot=(await db.query('select payload from private.order_email_outbox limit 1')).rows[0].payload;
  assert.equal(snapshot.items[0].name,'Teddy'); assert.equal(snapshot.total,120);
  await db.exec(`update public.orders set payment_status='pending' where id='${id}'`); assert.equal(await count(),2);
  const rights=(await db.query(`select has_function_privilege('anon','public.claim_order_email()','execute') a,has_function_privilege('authenticated','public.claim_order_email()','execute') u,has_function_privilege('service_role','public.claim_order_email()','execute') s`)).rows[0];
  assert.deepEqual(rights,{a:false,u:false,s:true});
  const claim=async () => (await db.query('select public.claim_order_email() job')).rows[0].job;
  const first=await claim(),second=await claim(); assert.notEqual(first.id,second.id); assert.equal(await claim(),null);
  await assert.rejects(db.query('select public.prepare_order_email($1,$2,$3)',[first.id,second.lease_token,{}]),/mismatch/);
  await db.query('select public.prepare_order_email($1,$2,$3)',[first.id,first.lease_token,{subject:'test'}]);
  await db.query('select public.finish_order_email($1,$2,null)',[first.id,first.lease_token]);
  await db.query('select public.finish_order_email($1,$2,$3)',[second.id,second.lease_token,'provider-id']);
  await assert.rejects(db.query('select public.finish_order_email($1,$2,$3)',[second.id,second.lease_token,'provider-id']),/expired/);
  await db.query("select public.record_order_email_event('evt-1','provider-id','delivered',now())");
  await db.query("select public.record_order_email_event('evt-1','provider-id','delivered',now())");
  await db.query("select public.record_order_email_event('evt-2','provider-id','delivery_delayed',now()-interval '1 hour')");
  assert.equal((await db.query("select delivery_status from private.order_email_outbox where provider_id='provider-id'")).rows[0].delivery_status,'delivered');
  assert.equal(Number((await db.query("select count(*) n from private.order_email_webhook_events where id='evt-1'")).rows[0].n),1);
  await db.exec("update private.order_email_outbox set available_at=now()-interval '1 minute' where state='pending'");
  const retry=await claim(); assert.equal(retry.id,first.id); assert.notEqual(retry.lease_token,first.lease_token); assert.deepEqual(retry.request,{subject:'test'});
  await assert.rejects(db.query('select public.prepare_order_email($1,$2,$3)',[retry.id,retry.lease_token,{subject:'changed'}]),/mismatch/);
  await db.query('select public.finish_order_email($1,$2,$3)',[retry.id,retry.lease_token,'provider-id-2']);
  await order('22222222-2222-4222-8222-222222222222','card'); assert.equal(await count(),2);
  await db.exec("update public.orders set payment_status='paid' where payment_method='card'"); assert.equal(await count(),4);
  await db.exec("update public.orders set payment_status='paid' where payment_method='card'"); assert.equal(await count(),4);
  await db.exec("update private.order_email_outbox set created_at=now()-interval '25 hours' where state='pending'");
  assert.equal(await claim(),null);
  assert.equal(Number((await db.query("select count(*) n from private.order_email_outbox where state='failed'")).rows[0].n),2);
  await db.exec('begin'); await db.exec(`insert into public.orders(id,payment_method,payment_status,status) values('33333333-3333-4333-8333-333333333333','cod','pending','pending')`); await db.exec('rollback'); assert.equal(await count(),4);
  console.log('PASS: migration, deferred snapshots, atomic rollback, role grants, event deduplication, leases, retries, immutable requests, paid-only card events, and expired retry quarantine. Isolated database only.');
} finally { await db.close(); }
