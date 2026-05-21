import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { type AuthErrorCode } from "@/core/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    roles?: string[];
    error?: AuthErrorCode;
    user: {
      id: string;
      roles?: string[];
      username?: string;
      permissions?: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    roles?: string[];
    username?: string;
    permissions?: string[];
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
