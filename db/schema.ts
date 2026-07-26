import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const storyDocuments = sqliteTable("story_documents", {
  id: integer("id").primaryKey(),
  documentJson: text("document_json").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
});

export const storyRevisions = sqliteTable("story_revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  version: integer("version").notNull(),
  documentJson: text("document_json").notNull(),
  authorEmail: text("author_email").notNull(),
  createdAt: text("created_at").notNull(),
});

export const storyImages = sqliteTable("story_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  objectKey: text("object_key").notNull().unique(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const portalDocuments = sqliteTable("portal_documents", {
  id: integer("id").primaryKey(),
  documentJson: text("document_json").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
});

export const portalRevisions = sqliteTable("portal_revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  version: integer("version").notNull(),
  documentJson: text("document_json").notNull(),
  authorEmail: text("author_email").notNull(),
  createdAt: text("created_at").notNull(),
});
