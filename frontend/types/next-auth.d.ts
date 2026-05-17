import type { User as AppUser } from "@/lib/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    apiUser?: AppUser;
  }

  interface Session extends DefaultSession {
    accessToken?: string;
    pendingTotpToken?: string;
    apiUser?: AppUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    pendingTotpToken?: string;
    apiUser?: AppUser;
  }
}
