import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [organization()],
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
