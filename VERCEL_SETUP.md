# SoftHaven Vercel setup

Connect the Vercel project to `fahimusman5-prog/softheaven`, with production branch `main`, framework **Next.js**, root directory **repository root**, install command `npm ci`, build command `npm run build`, output directory `.next`, and Node.js **22.x**.

## Production environment variables

In **Project → Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ecaoxnaokkjlotklquip.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The publishable key from this project's Supabase API Keys settings. Use the dedicated SoftHaven project. |
| `NEXT_PUBLIC_SITE_URL` | The full canonical production URL, including `https://`, without a trailing slash. |

The publishable key is public browser configuration. This application does not require a service-role key, database password, Vercel Blob, a second database, or a Vercel cron job.

Save the variables and deploy the latest `main` commit. If a deployment was created before the variables were added, **Redeploy** it: variable changes only apply to new deployments. Check that the deployment shows **Ready** before testing. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

For Preview deployments, use a separately configured test Supabase project if administrators will test writes. Do not automatically connect arbitrary preview branches to production commerce data.

## Supabase Auth configuration

In the dedicated project's **Authentication → URL Configuration**:

- Set **Site URL** to the canonical production origin.
- Allow `<production-origin>/auth/confirm` and `<production-origin>/auth/confirm?next=recovery`.
- Keep `http://localhost:3007/auth/confirm` and its recovery callback only if local development is still needed.
- Configure and verify SMTP confirmation/password recovery email delivery.

At the deployed `/admin`, create and confirm `fahimusman5@gmail.com` to activate the one-time SUPER_ADMIN bootstrap. Existing accounts should sign in normally; never reset a working account to repeat bootstrap.

## Commerce launch checks

Receive approved stock, review the preserved numeric catalogue prices, and create approved shipping zones/rates before accepting orders. Rewards start disabled. Configure them before enabling redemption. The current checkout uses COD; no online payment provider or email campaign sending service is configured. Refund actions record full refunds already completed externally and do not move money.

Verify login and recovery, admin create/edit/save/upload, product/stock changes, shipping quotes, a real checkout, order handling, and customer privacy on desktop and mobile. Local build/test success does not confirm a Vercel deployment or email delivery.

Database migrations in this repository have already been applied to `ecaoxnaokkjlotklquip`. Do not reset the production database or replay these migrations manually in Vercel.
