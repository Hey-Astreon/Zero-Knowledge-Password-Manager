import NextAuth, { DefaultSession } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        user?: {
            id?: string;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
    }
}

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || 'dummy_id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken as string;
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
});

export { handler as GET, handler as POST };
