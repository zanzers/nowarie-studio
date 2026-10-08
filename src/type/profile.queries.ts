
export type CreateAgentInput = {

    name: string;
    role: string;
    avatarUrl?: string;
    model: string;
    instructions: string;
}

export type CreateResultInput  = {
    agentId: string,
    input: unknown
}