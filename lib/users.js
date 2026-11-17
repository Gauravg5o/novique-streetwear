import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

export function getAllUsers() {
  try {
    const raw = fs.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

export function registerUser(email, password, name) {
  const users = getAllUsers();
  const existing = findUserByEmail(email);
  if (existing) {
    return { error: 'User already exists with this email' };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: email.trim().toLowerCase(),
    password,
    name: name || email.split('@')[0],
    role: 'user',
    createdAt: new Date().toISOString().split('T')[0],
  };

  users.push(newUser);
  saveUsers(users);
  return { user: newUser };
}
