#!/usr/bin/env node
/**
 * Prints a bcrypt hash for the admin password, to store as ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node scripts/hash-password.mjs            # prompts for the password
 *   node scripts/hash-password.mjs <password>
 */
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';

let password = process.argv[2];
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Admin password: ');
  rl.close();
}
if (!password) {
  console.error('No password given');
  process.exit(1);
}

console.log(await bcrypt.hash(password, 12));
