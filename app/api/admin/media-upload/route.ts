import { requireAdmin, sameOrigin, apiError } from '@/lib/admin/auth';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { db, user } = await requireAdmin('media');
    const data = await request.formData();
    const file = data.get('file');
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      file.size < 12
    )
      throw new Error('Upload an image up to 5 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    let type = '';
    let extension = '';
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
      type = 'image/jpeg';
      extension = 'jpg';
    } else if (
      [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
    ) {
      type = 'image/png';
      extension = 'png';
    } else if (
      new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
      new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
    ) {
      type = 'image/webp';
      extension = 'webp';
    } else if (
      new TextDecoder().decode(bytes.slice(4, 8)) === 'ftyp' &&
      ['avif', 'avis'].includes(new TextDecoder().decode(bytes.slice(8, 12)))
    ) {
      type = 'image/avif';
      extension = 'avif';
    }
    if (!type || type !== file.type)
      throw new Error('File contents do not match a supported image type.');
    const sharp = (await import('sharp')).default;
    const image = sharp(bytes, { limitInputPixels: 40000000, animated: false });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) throw new Error('Invalid image');
    const optimized = await image
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    type = 'image/webp';
    extension = 'webp';
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await db.storage
      .from('store-media')
      .upload(path, optimized, { contentType: type, upsert: false });
    if (error) throw new Error(error.message);
    const { data: publicUrl } = db.storage
      .from('store-media')
      .getPublicUrl(path);
    const { error: recordError } = await db
      .from('media_assets')
      .insert({
        name: file.name.slice(0, 200),
        path,
        url: publicUrl.publicUrl,
        mime_type: type,
        size_bytes: optimized.length,
        created_by: user.id,
      });
    if (recordError) {
      await db.storage.from('store-media').remove([path]);
      throw new Error(recordError.message);
    }
    return Response.json({ url: publicUrl.publicUrl });
  } catch (e) {
    return apiError(e);
  }
}
