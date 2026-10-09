import { createAgent, listAgents } from "@/app/agents/queries/profile";
import { createEmployeeSchema } from "@/app/agents/type/schema.type";
import { DatabaseErrorCode, HttpStatus } from "@/type/httpStatus";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const employees = await listAgents();
        return NextResponse.json(employees, { status: HttpStatus.OK });
    } catch (err) {
        console.error("GET /employees failed:", err);
        return NextResponse.json({
            error: "Failed to load employees"
        }, {
            status: HttpStatus.InternalServer_Error
        })
    }
}

export async function POST(req: Request) {
    let body: unknown

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({
            error: "Body must be valid JSON"
        }, { status: HttpStatus.Bad_Request })
    }
    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({
            error: "Invalid input", issues: parsed.error.issues
        }, { status: HttpStatus.Bad_Request });
    }

    try {
        const { agent, profile } = await createAgent(parsed.data);
        return NextResponse.json({ agent, profile }, { status: HttpStatus.Created })
    } catch (err: any) {
        const code = err?.code ?? err?.cause?.code;

        if (code === DatabaseErrorCode.alreadyExists) {
            return NextResponse.json({
                error: `An employee with role "${parsed.data.role}" already exists`
            }, { status: HttpStatus.Conflict });

        }
        console.error("POST /employee failed:", err);
        return NextResponse.json({
            error: "Failed to create employee"

        }, {
            status: HttpStatus.InternalServer_Error
        })
    }
}