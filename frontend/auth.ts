import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { User as AppUser } from "@/lib/types";
import { completeTotpOnBackend, exchangeGoogleIdToken } from "@/lib/auth-backend";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ??
  process.env.AUTH_GOOGLE_ID ??
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      id: "totp",
      name: "TOTP",
      credentials: {
        pendingToken: { type: "text" },
        code: { type: "text" },
        recoveryCode: { type: "text" },
      },
      authorize: async (credentials) => {
        const c = credentials as Record<string, string> | undefined;
        const pendingToken = c?.pendingToken?.trim();
        if (!pendingToken) return null;
        const code = c?.code?.trim() || undefined;
        const recoveryCode = c?.recoveryCode?.trim() || undefined;
        if (!code && !recoveryCode) return null;
        try {
          const data = await completeTotpOnBackend({ pendingToken, code, recoveryCode });
          if (!data.accessToken) return null;
          return {
            id: String(data.user.id),
            accessToken: data.accessToken,
            apiUser: data.user,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (trigger === "update" && session) {
        const s = session as {
          accessToken?: string | null;
          pendingTotpToken?: string | null;
          apiUser?: AppUser;
        };
        if (s.apiUser) token.apiUser = s.apiUser;
        if (s.accessToken !== undefined) token.accessToken = s.accessToken ?? undefined;
        if (s.pendingTotpToken !== undefined) {
          token.pendingTotpToken = s.pendingTotpToken ?? undefined;
        }
        return token;
      }

      if (account?.provider === "google" && account.id_token) {
        const data = await exchangeGoogleIdToken(account.id_token);
        token.accessToken = data.accessToken ?? undefined;
        token.pendingTotpToken = data.pendingTotpToken ?? undefined;
        token.apiUser = data.user;
        return token;
      }

      if (user && account?.provider === "totp") {
        const u = user as { accessToken?: string; apiUser?: AppUser };
        token.accessToken = u.accessToken;
        token.pendingTotpToken = undefined;
        token.apiUser = u.apiUser;
        return token;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.pendingTotpToken = token.pendingTotpToken as string | undefined;
      session.apiUser = token.apiUser as AppUser | undefined;
      return session;
    },
  },
});
