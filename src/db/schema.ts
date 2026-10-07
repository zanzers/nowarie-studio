import { resultStatus } from "../type/schema.type";
export { resultStatus };
import { boolean, integer, timestamp, pgTable, text, uuid, jsonb } from "drizzle-orm/pg-core";


export const profiles = pgTable("profile", {
  profileId: uuid("profileId").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatarUrl: text("avatarUrl"),
});

export const agents = pgTable("agents", {
  agentId: uuid("agentId").primaryKey().defaultRandom(),
  profileId: uuid("profileId").notNull().unique().references(() => profiles.profileId),
  role: text("role").notNull().unique(),
  mission: text("mision").notNull(),
});

export const promptFiles = pgTable("promptFiles", {
  promptId: uuid("promptId").primaryKey().defaultRandom(),
  agentId: uuid("agentId").notNull().references(() => agents.agentId),
  version: integer("version").notNull(),
  model: text("model").notNull(),
  content: text("content").notNull(),
  isActive: boolean("isActive").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const result = pgTable("result", {
  resultId: uuid("resultId").primaryKey().defaultRandom(),
  agentId: uuid("agentId").notNull().references(() => agents.agentId),
  input: jsonb("input"),
  output: jsonb("output"),
  status: resultStatus("status").notNull().default("draft"),
  revisionCount: integer("revisionCount").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});