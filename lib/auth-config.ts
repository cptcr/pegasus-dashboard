import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds"
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[AUTH] Sign in attempt:", { 
        userId: user?.id,
        provider: account?.provider 
      });
      // Allow any Discord user to sign in
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account && profile) {
        console.log("[AUTH] JWT - Initial sign in, storing token data");
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.id = profile.id as string;
        token.name = (profile as any).username || (profile as any).global_name;
        token.email = (profile as any).email;
        token.image = (profile as any).avatar 
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${(profile as any).avatar}.png`
          : null;
      }
      
      // Subsequent requests - token already has the data
      if (token.id) {
        console.log("[AUTH] JWT - Returning existing token for user:", token.id);
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH] Session - Creating session for user:", token.id);
      
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.accessToken = token.accessToken as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[AUTH] Redirect:", { url, baseUrl });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    }
  }
};