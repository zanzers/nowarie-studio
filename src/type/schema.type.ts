import { pgEnum } from "drizzle-orm/pg-core";


export const resultStatus = pgEnum("result_status", [ "draft", "waiting_approval", "approved", "rejected",]);
