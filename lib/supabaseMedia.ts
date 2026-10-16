export const supabaseMediaBucket =
  process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "music-audio";

export function isSupabaseMediaUrl(value: string): boolean {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl) return false;

  try {
    const expectedOrigin = new URL(projectUrl).origin;
    const videoUrl = new URL(value);
    const expectedPathPrefix = `/storage/v1/object/sign/${encodeURIComponent(supabaseMediaBucket)}/`;
    const mediaPath = videoUrl.pathname.toLowerCase();

    return (
      videoUrl.protocol === "https:" &&
      videoUrl.origin === expectedOrigin &&
      videoUrl.pathname.startsWith(expectedPathPrefix) &&
      (mediaPath.endsWith(".mp4") || mediaPath.endsWith(".mp3")) &&
      videoUrl.searchParams.has("token")
    );
  } catch {
    return false;
  }
}
