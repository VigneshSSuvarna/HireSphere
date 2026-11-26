import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'STUDENT' | 'COORDINATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  // Helper getters for seamless role checks
  isStudent: () => boolean;
  isCoordinator: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        set({
          user,
          token,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
        });
      },

      isStudent: () => get().user?.role === 'STUDENT',
      isCoordinator: () => get().user?.role === 'COORDINATOR',
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'auth-storage',
    }
  )
);