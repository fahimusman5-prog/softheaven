import {requireAdmin,apiError} from '@/lib/admin/auth';
import {version} from '@/package.json';
export async function GET(){try{await requireAdmin('settings');return Response.json({applicationVersion:version,commitSha:process.env.SOFTHAVEN_BUILD_SHA,builtAt:process.env.SOFTHAVEN_BUILD_TIME,environment:process.env.SOFTHAVEN_BUILD_ENV},{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});}catch(error){return apiError(error);}}
