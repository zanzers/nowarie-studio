import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { agents, profiles, results } from "@/db/schema";
import { CreateAgentInput, CreateResultInput } from "@/type/profile.queries";




export async function createAgent(data: CreateAgentInput){
    return db.transaction(async(tx) => {
        const [agent] = await tx.insert(agents).values({ model: data.model, instructions: data.instructions}).returning();
        const [profile] = await tx.insert(profiles).values({agentId: agent.agentId , name: data.name, role: data.role, avatarUrl: data.avatarUrl}).returning();
        return { agent, profile};
    });
}

export async function createResult(data: CreateResultInput){
    const [row] = await db.insert(results).values({agentId: data.agentId, input: data.input}).returning();
    return row;
}


export async function listAgents() {
  return db .select({
      agentId: agents.agentId,
      profileId: profiles.profileId,
      name: profiles.name,
      role: profiles.role,
      avatarUrl: profiles.avatarUrl,
      model: agents.model,
    }).from(profiles).innerJoin(agents, eq(profiles.agentId, agents.agentId));
}
 
export async function getAgent(agentId: string) {
  const [row] = await db.select().from(agents).innerJoin(profiles, eq(profiles.agentId, agents.agentId)).where(eq(agents.agentId, agentId));
  return row ?? null;
}
 
export async function getResult(resultId: string) {
  const [row] = await db.select().from(results).where(eq(results.resultId, resultId));
  return row ?? null;
}
 
export async function listResultsByAgent(agentId: string) {
  return db.select().from(results).where(eq(results.agentId, agentId)).orderBy(desc(results.createdAt));
}
 