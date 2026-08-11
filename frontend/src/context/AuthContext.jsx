import React, { createContext, useContext, useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

const AuthContext = createContext(null);

export const defaultDemoUsers = {
  super_admin: {
    id: 1,
    name: 'Super Admin SaaS',
    email: 'superadmin@littlehijabi.com',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  school_admin: {
    id: 2,
    name: 'Ustadzah Sarah (Admin TK)',
    email: 'admin.tk@littlehijabi.com',
    role: 'school_admin',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150'
  },
  principal: {
    id: 3,
    name: 'Bunda Maryam, M.Pd (Kepsek)',
    email: 'kepsek@littlehijabi.com',
    role: 'principal',
    avatar_url: 'https://images.unsplash.com/photo-1580894732468-9111ad5467e2?w=150'
  },
  teacher: {
    id: 4,
    name: 'Bu Ani, S.Pd (Wali Kelas TK A)',
    email: 'guru.ani@littlehijabi.com',
    role: 'teacher',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  parent: {
    id: 5,
    name: 'Bapak Budi (Orang Tua Aisyah)',
    email: 'ortu.budi@littlehijabi.com',
    role: 'parent',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  student: {
    id: 6,
    name: 'Aisyah Putri Humaira (Siswa TK A)',
    email: 'aisyah@littlehijabi.com',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=150'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lh_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData, token = null) => {
    setUser(userData);
    localStorage.setItem('lh_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const loginWithApi = async ({ email, password, role }) => {
    try {
      const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, { email, password, role });
      if (res && res.success && res.data) {
        login(res.data.user, res.data.token);
        return res.data.user;
      }
      throw new Error(res?.message || 'Login gagal');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login gagal, periksa kembali email & password anda.';
      throw new Error(message);
    }
  };

  const loginAsRole = async (roleKey) => {
    const fallbackUser = defaultDemoUsers[roleKey] || defaultDemoUsers.teacher;
    return await loginWithApi({ email: fallbackUser.email, password: 'password123', role: roleKey });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lh_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithApi, loginAsRole, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
