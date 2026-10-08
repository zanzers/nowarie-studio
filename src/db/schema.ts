import { resultStatus } from "../type/schema.type";
export { resultStatus };
import { boolean, integer, timestamp, pgTable, text, uuid, jsonb, numeric } from "drizzle-orm/pg-core";


export const agents = pgTable("agents", {
  agentId: uuid("agent_id").primaryKey().defaultRandom(),
  model: text("model").notNull(),
  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});


export const profiles = pgTable("profile", {
  profileId: uuid("profile_id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().unique().references(() => agents.agentId),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});



export const agentCost = pgTable("agent_cost", {
  agentCost: uuid("agent_cost_id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.agentId),
  costPhp: numeric("cost_php", { precision: 12, scale: 4 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const results = pgTable("result", {
  resultId: uuid("result_id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.agentId),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  status: resultStatus("status").notNull().default("draft"),
  revisionCount: integer("revision_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});