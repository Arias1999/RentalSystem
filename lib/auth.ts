export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  createdAt: string;
}

const USERS_KEY = 'driveeasy_users';
const SESSION_KEY = 'driveeasy_session';
const AUTH_CHANGE_EVENT = 'driveeasy-auth-change';

function notifyAuthChange(): void {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function getUsers(): (User & { password: string })[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

export function register(
  name: string,
  email: string,
  password: string,
  phone?: string,
  profile?: Pick<User, 'address' | 'licenseNumber' | 'licenseExpiry'>,
): { error?: string; user?: User } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Email already registered.' };
  }
  const user: User = { id: Date.now().toString(), name, email, phone, ...profile, createdAt: new Date().toISOString() };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...user, password }]));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  notifyAuthChange();
  return { user };
}

export function login(email: string, password: string): { error?: string; user?: User } {
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) return { error: 'Invalid email or password.' };
  const { password: _, ...user } = found;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  notifyAuthChange();
  return { user };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  notifyAuthChange();
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function updateProfile(profile: Pick<User, 'name' | 'phone' | 'address'>): { error?: string; user?: User } {
  const session = getSession();
  if (!session) return { error: 'Please sign in to update your profile.' };

  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === session.id);
  if (userIndex < 0) return { error: 'We could not find your account. Please sign in again.' };

  const { password: _, ...storedUser } = users[userIndex];
  const updatedUser: User = { ...storedUser, ...session, ...profile };
  users[userIndex] = { ...users[userIndex], ...profile };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  notifyAuthChange();
  return { user: updatedUser };
}

export function authChangeEventName(): string {
  return AUTH_CHANGE_EVENT;
}
