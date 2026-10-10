import { getAgent,  updateAgent } from "@/app/agents/queries/profile";
import { idSchema, patchSchema } from "@/app/agents/type/schema.type";
import { HttpStatus } from "@/type/httpStatus";
import { Ctx } from "@/type/profile.queries";
import { NextResponse } from "next/server";


export async function GET(_req: Request, { params }: Ctx) {
    const { id } = await params;

    if (!idSchema.safeParse(id).success){
        return NextResponse.json({
            error: "Invalid UUID"
        }, { status: HttpStatus.Bad_Request });
    }

    try {
        const row = await getAgent(id);
        if (!row) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ agent: row.agents, profile: row.profile });
    } catch (err) {
        console.error("GET /employee/[id] failed:", err);
        return NextResponse.json({ error: "Failed to load employee" }, { status: 500 });
    }
}


export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "id must be a valid UUID" }, { status: 400 });
  }
 
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
 
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
 
  try {
    const agent = await updateAgent({agentId:id, ...parsed.data});
    if (!agent) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ agent });
  } catch (err) {
    console.error("PATCH /employee/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}