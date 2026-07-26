import { createDefaultPortal, normalizePortalDocument, type PortalDocument } from "../content/portal";
import { getStoryDocument } from "./story-store";

type D1DatabaseLike = {
  prepare(query: string): {
    bind(...values: unknown[]): ReturnType<D1DatabaseLike["prepare"]>;
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results?: T[] }>;
  };
  batch(statements: ReturnType<D1DatabaseLike["prepare"]>[]): Promise<unknown>;
};

export type PortalRevision = { id: number; version: number; authorEmail: string; createdAt: string };

async function getDatabase(): Promise<D1DatabaseLike | null> {
  const { env } = await import("cloudflare:workers");
  return ((env as unknown as { DB?: D1DatabaseLike }).DB ?? null);
}

async function ensurePortalSchema(): Promise<D1DatabaseLike | null> {
  const database = await getDatabase();
  if (!database) return null;
  await database.batch([
    database.prepare("CREATE TABLE IF NOT EXISTS portal_documents (id INTEGER PRIMARY KEY, document_json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL)"),
    database.prepare("CREATE TABLE IF NOT EXISTS portal_revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, version INTEGER NOT NULL, document_json TEXT NOT NULL, author_email TEXT NOT NULL, created_at TEXT NOT NULL)"),
    database.prepare("CREATE INDEX IF NOT EXISTS portal_revisions_version_idx ON portal_revisions(version)"),
  ]);
  return database;
}

function parsePortal(value: string | null | undefined): PortalDocument | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as PortalDocument;
    return parsed?.schemaVersion === 2 && Array.isArray(parsed.courses) ? normalizePortalDocument(parsed) : null;
  } catch { return null; }
}

export async function getPortalDocument(): Promise<PortalDocument> {
  try {
    const [database, story] = await Promise.all([ensurePortalSchema(), getStoryDocument()]);
    if (!database) return normalizePortalDocument(createDefaultPortal(story));
    const row = await database.prepare("SELECT document_json AS documentJson FROM portal_documents WHERE id = 1").first<{ documentJson: string }>();
    return parsePortal(row?.documentJson) ?? normalizePortalDocument(createDefaultPortal(story));
  } catch {
    return normalizePortalDocument(createDefaultPortal());
  }
}

export async function savePortalDocument(document: PortalDocument, authorEmail: string): Promise<number> {
  const database = await ensurePortalSchema();
  if (!database) throw new Error("포털 저장소를 사용할 수 없습니다.");
  const current = await database.prepare("SELECT version FROM portal_documents WHERE id = 1").first<{ version: number }>();
  const version = (current?.version ?? 0) + 1;
  const now = new Date().toISOString();
  const json = JSON.stringify(normalizePortalDocument(document));
  await database.batch([
    database.prepare("INSERT INTO portal_revisions (version, document_json, author_email, created_at) VALUES (?, ?, ?, ?)").bind(version, json, authorEmail, now),
    database.prepare("INSERT INTO portal_documents (id, document_json, version, updated_at, updated_by) VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET document_json = excluded.document_json, version = excluded.version, updated_at = excluded.updated_at, updated_by = excluded.updated_by").bind(json, version, now, authorEmail),
    database.prepare("DELETE FROM portal_revisions WHERE id NOT IN (SELECT id FROM portal_revisions ORDER BY id DESC LIMIT 30)"),
  ]);
  return version;
}

export async function listPortalRevisions(): Promise<PortalRevision[]> {
  const database = await ensurePortalSchema();
  if (!database) return [];
  await database.prepare("DELETE FROM portal_revisions WHERE id NOT IN (SELECT id FROM portal_revisions ORDER BY id DESC LIMIT 30)").run();
  const result = await database.prepare("SELECT id, version, author_email AS authorEmail, created_at AS createdAt FROM portal_revisions ORDER BY id DESC LIMIT 30").all<PortalRevision>();
  return result.results ?? [];
}

export async function restorePortalRevision(revisionId: number, authorEmail: string) {
  const database = await ensurePortalSchema();
  if (!database) throw new Error("포털 저장소를 사용할 수 없습니다.");
  const row = await database.prepare("SELECT document_json AS documentJson FROM portal_revisions WHERE id = ?").bind(revisionId).first<{ documentJson: string }>();
  const document = parsePortal(row?.documentJson);
  if (!document) throw new Error("선택한 저장본을 찾을 수 없습니다.");
  const version = await savePortalDocument(document, authorEmail);
  return { document, version };
}

export function findCourse(document: PortalDocument, courseId: string) {
  return document.courses.find((course) => course.id === courseId) ?? null;
}

export function findTopic(document: PortalDocument, courseId: string, topicId: string) {
  const course = findCourse(document, courseId);
  return course ? { course, topic: course.topics.find((topic) => topic.id === topicId) ?? null } : { course: null, topic: null };
}
