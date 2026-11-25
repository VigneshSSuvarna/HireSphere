import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { users } from './schema.js';

async function seedAdmin() {
  const email = (process.env.ADMIN_SEED_EMAIL || 'admin@hiresphere.edu').toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing[0]) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, existing[0].id));
    console.log(`Admin account ensured for ${email}`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  await db.insert(users).values({
    email,
    password_hash,
    role: 'ADMIN',
  });

  console.log(`Seeded initial admin account: ${email}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
