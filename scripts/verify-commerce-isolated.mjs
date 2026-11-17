// Executes repository migrations/tests in a disposable PostgreSQL/WASM database.
// Auth/storage helpers below are fixtures, not a certification of hosted Supabase services.
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create role service_role;
 create schema auth;create schema storage;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('sub',auth.uid())$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner uuid,metadata jsonb);
 alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
 create function storage.extension(text) returns text language sql immutable as $$select regexp_replace($1,'^.*\\.','')$$;
 grant usage on schema auth,storage to anon,authenticated;
 grant select,insert,update,delete on storage.objects to authenticated;grant select on storage.objects to anon;`);
 for(const name of (await fs.readdir('supabase/migrations')).filter(n=>n.endsWith('.sql')).sort()){
  try{await db.exec(await fs.readFile('supabase/migrations/'+name,'utf8'));}catch(e){throw new Error('Migration '+name+': '+e.message);}
 }
 // Hosted suites assume an existing owner; provide that fixture without disabling the last-admin guard.
 await db.exec("insert into auth.users(id,email,email_confirmed_at) values('99999999-9999-4999-8999-999999999999','owner@softhaven.invalid',now());insert into public.admin_users(id,role) values('99999999-9999-4999-8999-999999999999','SUPER_ADMIN')");
 for(const name of ['database-regression.sql','admin-workspace-regression.sql','request-budget-regression.sql']){
  try{await db.exec(await fs.readFile('tests/'+name,'utf8'));console.log('PASS: '+name+' (isolated PostgreSQL; fixtures rolled back)');}catch(e){throw new Error(name+': '+e.message);}
 }
}finally{await db.close();}
