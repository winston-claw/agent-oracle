import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const auth = convexAuth(api);

export type Auth = typeof auth;
