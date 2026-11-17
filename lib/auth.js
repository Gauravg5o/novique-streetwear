import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { findUserByEmail, registerUser } from './users';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'novique_super_secret_jwt_key_2026'
);

const ADMIN_EMAIL = 'gauravmishra5621@gmail.com';
const VALID_ADMIN_PASSWORDS = [
  'Gaurav@#95#@+-',
  'Gaurav@#95#2+-', // keyboard fallback where Shift+2 is missed
];

export async function signAuthToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
}

export async function verifyAuthToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('novique_auth_token')?.value || cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

// Backward-compatible for admin APIs
export async function getAdminSession() {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export function authenticateUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  // 1. Check Store Owner / Admin Credentials
  if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    if (VALID_ADMIN_PASSWORDS.includes(cleanPass)) {
      return {
        success: true,
        user: {
          id: 'admin-gaurav',
          email: 'Gauravmishra5621@gmail.com',
          name: 'Gaurav Mishra',
          role: 'admin',
        },
      };
    }
    return {
      success: false,
      error: 'Incorrect admin password. Please enter your credentials carefully.',
    };
  }

  // 2. Check Customer Credentials in data/users.json
  const customer = findUserByEmail(cleanEmail);
  if (!customer) {
    return {
      success: false,
      error: 'No account found with this email. Please click "Create Account (Sign Up)" below.',
    };
  }

  if (customer.password !== cleanPass) {
    return {
      success: false,
      error: 'Incorrect password. Please verify and try again.',
    };
  }

  return {
    success: true,
    user: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'user',
    },
  };
}

export function registerCustomer(email, password, name) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const cleanName = (name || '').trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (cleanPass.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  // Admin email cannot be registered as normal customer
  if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: 'This email is reserved for Store Administration. Please switch to Sign In.',
    };
  }

  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please Sign In instead.',
    };
  }

  const reg = registerUser(cleanEmail, cleanPass, cleanName || cleanEmail.split('@')[0]);
  if (reg.error) {
    return { success: false, error: reg.error };
  }

  return {
    success: true,
    user: reg.user,
  };
}

export function socialLoginOrRegister(provider, profile = {}) {
  const cleanEmail = (profile.email || `${provider}_user_${Date.now()}@novique.in`).trim().toLowerCase();
  const name = profile.name || (provider.charAt(0).toUpperCase() + provider.slice(1) + ' User');

  // If Gaurav signs in with Google using his admin email
  if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    return {
      success: true,
      user: {
        id: 'admin-gaurav',
        email: 'Gauravmishra5621@gmail.com',
        name: 'Gaurav Mishra',
        role: 'admin',
        provider,
      },
    };
  }

  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return {
      success: true,
      user: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: 'user',
        provider,
      },
    };
  }

  // Register new social customer in data/users.json
  const reg = registerUser(cleanEmail, `oauth_${provider}_${Date.now()}`, name);
  return {
    success: true,
    user: {
      ...reg.user,
      provider,
    },
  };
}
