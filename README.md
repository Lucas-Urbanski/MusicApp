This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI providers and media uploads

Configure `GEMINI_API_KEY` and `SUNO_API_KEY` as server-side environment variables. Text prompts use Gemini first; MP4 and MP3 attachments use Suno first, with automatic fallback to the other provider.

MP4 and MP3 files upload directly to a private Supabase Storage bucket so large files do not pass through the Vercel request-size limit. Use the existing private bucket named `music-videos` (or set `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` to a different bucket), set its per-file limit to 500 MB, and allow the `video/mp4` and `audio/mpeg` MIME types. MP4s are limited to 100 MB; MP3s are limited to 500 MB.

Suno supports MP3 reference audio between 6 seconds and 30 minutes long. Uploads that are still being processed by Suno after three minutes are retained so Suno can finish fetching the reference; completed or failed requests remove their temporary upload.

Add these policies to `storage.objects` in the Supabase SQL editor. They let authenticated users upload, read, and remove only MP4/MP3 files stored under their own user ID folder:

```sql
create policy "Users upload their own music media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'music-videos'
  and lower(storage.extension(name)) in ('mp4', 'mp3')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users read their own music media"
on storage.objects for select to authenticated
using (
  bucket_id = 'music-videos'
  and lower(storage.extension(name)) in ('mp4', 'mp3')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users remove their own music media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'music-videos'
  and lower(storage.extension(name)) in ('mp4', 'mp3')
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
