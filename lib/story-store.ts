import { cloneDefaultStory, type StoryDocument } from "../content/story";

type D1DatabaseLike = {
  prepare(query: string): {
    bind(...values: unknown[]): ReturnType<D1DatabaseLike["prepare"]>;
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results?: T[] }>;
  };
  batch(statements: ReturnType<D1DatabaseLike["prepare"]>[]): Promise<unknown>;
};

export type StoryRevision = {
  id: number;
  version: number;
  authorEmail: string;
  createdAt: string;
};

async function db(): Promise<D1DatabaseLike | null> {
  const { env } = await import("cloudflare:workers");
  return ((env as unknown as { DB?: D1DatabaseLike }).DB ?? null);
}

export async function ensureStorySchema(database?: D1DatabaseLike | null): Promise<D1DatabaseLike | null> {
  database ??= await db();
  if (!database) return null;
  await database.batch([
    database.prepare("CREATE TABLE IF NOT EXISTS story_documents (id INTEGER PRIMARY KEY, document_json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL)"),
    database.prepare("CREATE TABLE IF NOT EXISTS story_revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, version INTEGER NOT NULL, document_json TEXT NOT NULL, author_email TEXT NOT NULL, created_at TEXT NOT NULL)"),
    database.prepare("CREATE TABLE IF NOT EXISTS story_images (id INTEGER PRIMARY KEY AUTOINCREMENT, object_key TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, content_type TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, uploaded_by TEXT NOT NULL, created_at TEXT NOT NULL)"),
    database.prepare("CREATE TABLE IF NOT EXISTS story_audio (id INTEGER PRIMARY KEY AUTOINCREMENT, object_key TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, content_type TEXT NOT NULL, uploaded_by TEXT NOT NULL, created_at TEXT NOT NULL)"),
    database.prepare("CREATE INDEX IF NOT EXISTS story_revisions_version_idx ON story_revisions(version)"),
  ]);
  return database;
}

function parseDocument(value: string | null | undefined): StoryDocument | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as StoryDocument;
    if (parsed?.schemaVersion !== 1 || !parsed.hero || !Array.isArray(parsed.chapters)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getStoryDocument(): Promise<StoryDocument> {
  try {
    const database = await ensureStorySchema();
    if (!database) return cloneDefaultStory();
    const row = await database.prepare("SELECT document_json AS documentJson FROM story_documents WHERE id = 1").first<{ documentJson: string }>();
    return parseDocument(row?.documentJson) ?? cloneDefaultStory();
  } catch {
    return cloneDefaultStory();
  }
}

export async function saveStoryDocument(document: StoryDocument, authorEmail: string): Promise<number> {
  const database = await ensureStorySchema();
  if (!database) throw new Error("콘텐츠 저장소를 사용할 수 없습니다.");
  const current = await database.prepare("SELECT version FROM story_documents WHERE id = 1").first<{ version: number }>();
  const version = (current?.version ?? 0) + 1;
  const now = new Date().toISOString();
  const json = JSON.stringify(document);
  await database.batch([
    database.prepare("INSERT INTO story_revisions (version, document_json, author_email, created_at) VALUES (?, ?, ?, ?)").bind(version, json, authorEmail, now),
    database.prepare("INSERT INTO story_documents (id, document_json, version, updated_at, updated_by) VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET document_json = excluded.document_json, version = excluded.version, updated_at = excluded.updated_at, updated_by = excluded.updated_by").bind(json, version, now, authorEmail),
    database.prepare("DELETE FROM story_revisions WHERE id NOT IN (SELECT id FROM story_revisions ORDER BY id DESC LIMIT 30)"),
  ]);
  return version;
}

export async function listStoryRevisions(): Promise<StoryRevision[]> {
  const database = await ensureStorySchema();
  if (!database) return [];
  await database.prepare("DELETE FROM story_revisions WHERE id NOT IN (SELECT id FROM story_revisions ORDER BY id DESC LIMIT 30)").run();
  const result = await database.prepare("SELECT id, version, author_email AS authorEmail, created_at AS createdAt FROM story_revisions ORDER BY id DESC LIMIT 30").all<StoryRevision>();
  return result.results ?? [];
}

export async function restoreStoryRevision(revisionId: number, authorEmail: string): Promise<{ document: StoryDocument; version: number }> {
  const database = await ensureStorySchema();
  if (!database) throw new Error("콘텐츠 저장소를 사용할 수 없습니다.");
  const row = await database.prepare("SELECT document_json AS documentJson FROM story_revisions WHERE id = ?").bind(revisionId).first<{ documentJson: string }>();
  const document = parseDocument(row?.documentJson);
  if (!document) throw new Error("선택한 저장본을 찾을 수 없습니다.");
  const version = await saveStoryDocument(document, authorEmail);
  return { document, version };
}

export async function recordStoryImage(input: { key: string; name: string; type: string; width: number; height: number; email: string }): Promise<void> {
  const database = await ensureStorySchema();
  if (!database) return;
  await database.prepare("INSERT INTO story_images (object_key, original_name, content_type, width, height, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(input.key, input.name, input.type, input.width, input.height, input.email, new Date().toISOString()).run();
}

export async function recordStoryAudio(input: { key: string; name: string; type: string; email: string }): Promise<void> {
  const database = await ensureStorySchema();
  if (!database) return;
  await database.prepare("INSERT INTO story_audio (object_key, original_name, content_type, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(input.key, input.name, input.type, input.email, new Date().toISOString()).run();
}
