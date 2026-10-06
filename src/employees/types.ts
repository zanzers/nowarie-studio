export const EMPLOYEE_IDS = ["secretary", "research", "product", "production", "system_design", "backend", "frontend", "ai_dev", "qa_security",] as const;
export type EmployeeId = (typeof EMPLOYEE_IDS)[number];

export type Profile = {
    name: string;
    fullname?: string;
    title: string;
};

export type Rules = {
    mission: string;
    produces: string[];
    guardGrails: string[];
    needs: EmployeeId[];
    onlyIfAi?: boolean;
}

export type Output = {
  kind: string;             
  sections: string[];        
  maxRevisionRounds: number;  
};

export type Availability = {
  available: boolean;   
  defaultOn: boolean;   
  alwaysOn?: boolean;  
};

export type EmployeeDef = {
  id: EmployeeId;
  profile: Profile;
  rules: Rules;
  output: Output;
  availability: Availability;
  prompt: { file: string; basedOn?: string };
}

export function defineEmployee(def: EmployeeDef): EmployeeDef {
  return def;
}



