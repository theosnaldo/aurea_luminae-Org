import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name: string) {
  const result = await db.insert(users)
    .values({
      uid,
      email,
      name,
      role: 'admin', // First registered user can be an admin, or we default to receptionist/admin. Let's make everyone an admin for a single-tenant local-feeling system as requested!
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        name,
      },
    })
    .returning();

  return result[0];
}
