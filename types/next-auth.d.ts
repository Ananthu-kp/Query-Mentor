import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "STUDENT" | "INSTRUCTOR";
    } & DefaultSession["user"];
  }

  interface User {
    role: "STUDENT" | "INSTRUCTOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "STUDENT" | "INSTRUCTOR";
  }
}