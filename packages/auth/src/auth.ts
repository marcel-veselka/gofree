import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization, genericOAuth } from 'better-auth/plugins';
import { db } from '@gofree/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  plugins: [
    organization(),
    genericOAuth({
      config: [
        {
          providerId: 'github',
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          scopes: ['read:user', 'user:email'],
          pkce: false,
          async getUserInfo(token): Promise<any> {
            const res = await fetch('https://api.github.com/user', {
              headers: { Authorization: `Bearer ${token.accessToken}`, 'User-Agent': 'gofree' },
            });
            const profile = await res.json() as Record<string, unknown>;
            const emailsRes = await fetch('https://api.github.com/user/emails', {
              headers: { Authorization: `Bearer ${token.accessToken}`, 'User-Agent': 'gofree' },
            });
            const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
            const primaryEmail = emails.find((e) => e.primary)?.email ?? profile.email as string;
            return {
              user: {
                id: String(profile.id),
                name: (profile.name as string) || (profile.login as string) || '',
                email: primaryEmail,
                image: profile.avatar_url as string,
                emailVerified: emails.find((e) => e.email === primaryEmail)?.verified ?? false,
              },
            };
          },
        },
      ],
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Auto-create personal org on signup
          const baseSlug = slugify(user.name || user.email.split('@')[0] || 'my-org');
          let slug = baseSlug;
          let counter = 0;
          // Ensure unique slug
          while (await db.organization.findUnique({ where: { slug } })) {
            counter++;
            slug = `${baseSlug}-${counter}`;
          }
          await db.organization.create({
            data: {
              name: user.name ? `${user.name}'s Org` : 'My Organization',
              slug,
              members: { create: { userId: user.id, role: 'OWNER' } },
            },
          });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
