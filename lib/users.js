import initialUsers from '@/data/users.json';

let memoryUsers = Array.isArray(initialUsers) ? [...initialUsers] : [];

function getFsUsers() {
  try {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const path = require('path');
      const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
      if (fs.existsSync(USERS_PATH)) {
        const raw = fs.readFileSync(USERS_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryUsers = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // Edge runtime
  }
  return memoryUsers;
}

function saveFsUsers(users) {
  memoryUsers = users;
  try {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const path = require('path');
      const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
      fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    }
  } catch {
    // Edge runtime
  }
}

export function getAllUsers() {
  return getFsUsers();
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function saveUsers(users) {
  saveFsUsers(users);
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
