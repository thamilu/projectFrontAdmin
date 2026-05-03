import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { AuthErrorCode } from "@/lib/auth/errors";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    roles?: string[];
    error?: AuthErrorCode;
    user: {
      id: string;
      roles?: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires?: number;
    roles?: string[];
    error?: AuthErrorCode;
  }
}
