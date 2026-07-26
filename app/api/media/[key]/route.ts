type R2Object = { body: ReadableStream; httpMetadata?: { contentType?: string; cacheControl?: string }; etag?: string };
type Bucket = { get(key: string): Promise<R2Object | null> };

export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: Bucket }).BUCKET;
  if (!bucket) return new Response("Not found", { status: 404 });
  const object = await bucket.get(decodeURIComponent(key));
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
  headers.set("Cache-Control", object.httpMetadata?.cacheControl ?? "public, max-age=31536000, immutable");
  if (object.etag) headers.set("ETag", object.etag);
  return new Response(object.body, { headers });
}
