import { pgTable, pgEnum, uuid, text, jsonb, integer, numeric, timestamp, unique, boolean, } from "drizzle-orm/pg-core";


export const versionStatus = pgEnum("version_status", [
  "draft", "waiting_approval", "approved", "changes_requested", "rejected", "superseded",
]);


export const projectStatus = pgEnum("project_status", [
  "intake", "clarifying", "charter_pending", "active", "done",
]);

export const employees = pgTable("employees", {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    position: text("position").notNull(),
    avatar: text("avatar"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const employeeRules = pgTable("employee_rules", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").notNull().unique().references(() => employees.id, { onDelete: "cascade"}),
    mission: text("mission").notNull(),
    maxRevisionRounds: integer("max_revision_rounds").notNull().default(5),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const employeeRuleItems  = pgTable("employee_rule_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").notNull().references(() => employeeRules.id, {onDelete: "cascade"}),
    type: text("type").notNull(),
    value: text("value").notNull(),
    priority: integer("priority").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})


export const employeeOutputs  = pgTable("employee_outputs", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").notNull().unique().references(() => employees.id, { onDelete: "cascade"}),
    outputKind: text("output_kind").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(), 
})


export const employeeOutputSections = pgTable("employee_output_sections", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeOutputId: uuid("employee_output_id").notNull().references(() => employeeOutputs.id, { onDelete: "cascade",}),
    section: text("section").notNull(),
    priority: integer("priority").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const employeePromptReferences = pgTable("employee_prompt_references", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").notNull().unique().references(() => employees.id, { onDelete: "cascade",}),
    promptFile: text("prompt_file"),
    promptBasedOn: text("prompt_based_on"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(), 
   
});



export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: projectStatus("status").notNull().default("intake"),
  employeeOverrides: jsonb("employee_overrides").$type<Record<string, boolean>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().unique().references(() => projects.id, { onDelete: "cascade" }),
  form: jsonb("form").notNull(),
  answer: jsonb("answer"),
  lockedAt: timestamp("locked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agent = pgTable("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "restrict" }),
  task: text("task").notNull(),
  promptVersion: text("prompt_version").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const agentModels = pgTable("agent_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().unique().references(() => agent.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentCost = pgTable("agent_cost", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().unique().references(() => agent.id, { onDelete: "cascade" }),
  costPhp: numeric("cost_php", { precision: 12, scale: 4, }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentUsage = pgTable("agent_usage", {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").notNull().unique().references(() => agent.id, { onDelete: "cascade" }),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),
    latencyMs: integer("latency_ms"),
    retries: integer("retries").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique().on(t.projectId, t.kind)]);

export const deliverableSteps = pgTable("deliverable_steps", {
    id: uuid("id").primaryKey().defaultRandom(),
    deliverableId: uuid("deliverable_id").notNull().references(() => deliverables.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id").notNull().references(() => employees.id),
    stepOrder: integer("step_order").notNull(),
    status: text("status").notNull().default("pending"),  
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [ unique().on(t.deliverableId, t.stepOrder),]);

export const deliverableVersions = pgTable("deliverable_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id").notNull().references(() => deliverables.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: jsonb("content").notNull(),
  status: versionStatus("status").notNull().default("waiting_approval"),
  decisionComment: text("decision_comment"),
  decidedAt: timestamp("decided_at"),
  agentRunId: uuid("agent_run_id").references(() => agent.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique().on(t.deliverableId, t.version)]);


export const approval = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableStepId: uuid("deliverable_step_id").notNull().references(() => deliverableSteps.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  comment: text("comment"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});



