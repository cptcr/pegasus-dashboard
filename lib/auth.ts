import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./database";

export const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.accessToken = account.access_token;
        token.tokenType = account.token_type;
      }
      return token;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "discord") {
        const response = await fetch(
          `https://discord.com/api/users/@me/guilds`,
          {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          }
        );
        
        if (response.ok) {
          const guilds = await response.json();
          const isAdmin = guilds.some((guild: any) => 
            (guild.permissions & 0x8) === 0x8
          );
          
          if (!isAdmin) {
            return false;
          }
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);